import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase, isSupabaseConfigured, mapRowToClient, mapClientToRow } from '@/lib/supabase';
import { decodeSession, SESSION_COOKIE_NAME, SessionPayload } from '@/lib/auth';
import { generateNextClientId } from '@/lib/operationalUtils';
import { Client } from '@/lib/types';

async function getAuthSession(request: Request): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const decoded = decodeSession(token);
      if (decoded) return decoded;
    }
  } catch {}

  const adminHeader = request.headers.get('x-admin-key');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (adminHeader && serviceKey && adminHeader === serviceKey) {
    return {
      userId: 'admin-service-key',
      email: 'admin@atlasnet.ma',
      username: 'admin',
      name: 'Service Admin',
      role: 'admin',
      exp: Date.now() + 3600000,
    };
  }

  return null;
}

function getDatabaseClient() {
  const admin = getSupabaseAdmin();
  if (admin) return admin;
  if (isSupabaseConfigured && supabase) return supabase;
  return null;
}

export async function GET(request: Request) {
  try {
    const db = getDatabaseClient();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
    }

    const { data, error } = await db
      .from('clients')
      .select('*')
      .limit(10000)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[API/clients GET] Error fetching clients:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const clients = (data || []).map(mapRowToClient);
    return NextResponse.json({ success: true, clients });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/clients GET] Exception:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Non autorisé. Veuillez vous connecter.' }, { status: 401 });
    }

    const db = getDatabaseClient();
    if (!db) {
      return NextResponse.json({ error: 'Base de données non configurée.' }, { status: 503 });
    }

    const rawClient = (await request.json()) as Client;
    if (!rawClient || !rawClient.name) {
      return NextResponse.json({ error: 'Données client invalides ou nom manquant.' }, { status: 400 });
    }

    const client: Client = { ...rawClient };

    // Collision-proof ID check against live database
    const { data: existingDbIds } = await db.from('clients').select('id');
    const existingList = (existingDbIds || []) as Array<{ id: string }>;
    const existingSet = new Set(existingList.map((c) => c.id));

    if (!client.id || existingSet.has(client.id)) {
      client.id = generateNextClientId(existingList);
    }

    const row = mapClientToRow(client);
    const { data: inserted, error } = await db
      .from('clients')
      .upsert(row)
      .select()
      .single();

    if (error) {
      console.warn('[API/clients POST] Insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const savedClient = inserted ? mapRowToClient(inserted) : client;
    return NextResponse.json({ success: true, client: savedClient });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/clients POST] Exception:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Non autorisé. Veuillez vous connecter.' }, { status: 401 });
    }

    const db = getDatabaseClient();
    if (!db) {
      return NextResponse.json({ error: 'Base de données non configurée.' }, { status: 503 });
    }

    const body = await request.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ error: 'ID du client requis pour la modification.' }, { status: 400 });
    }

    const updates = { ...body };
    delete updates.id;

    const row = mapClientToRow(updates);
    delete row.id;
    row.updated_at = new Date().toISOString();

    const { error } = await db.from('clients').update(row).eq('id', id);
    if (error) {
      console.warn('[API/clients PATCH] Update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/clients PATCH] Exception:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession(request);
    // RBAC: Technicians and Field Leads are strictly blocked from deleting subscribers
    if (session && (session.role === 'technician' || session.role === 'field_lead')) {
      return NextResponse.json(
        { error: 'Action non autorisée. Seul un administrateur peut supprimer un abonné.' },
        { status: 403 }
      );
    }

    if (!session && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Non autorisé. Veuillez vous connecter.' }, { status: 401 });
    }

    const db = getDatabaseClient();
    if (!db) {
      return NextResponse.json({ error: 'Base de données non configurée.' }, { status: 503 });
    }

    let id: string | null = null;
    try {
      const body = await request.json();
      id = body?.id || null;
    } catch {
      const url = new URL(request.url);
      id = url.searchParams.get('id');
    }

    if (!id) {
      return NextResponse.json({ error: 'ID client manquant.' }, { status: 400 });
    }

    // 1. Delete associated tickets for this client
    await db.from('tickets').delete().eq('client_id', id);

    // 2. Delete subscriber record from clients table
    // (Preserve historical payments in payment_logs / payments for accounting audit integrity)
    const { error } = await db.from('clients').delete().eq('id', id);
    if (error) {
      console.warn('[API/clients DELETE] Delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/clients DELETE] Exception:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
