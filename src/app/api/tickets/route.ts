import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase, isSupabaseConfigured, mapRowToTicket, mapTicketToRow } from '@/lib/supabase';
import { decodeSession, SESSION_COOKIE_NAME, SessionPayload } from '@/lib/auth';
import { Ticket } from '@/lib/types';

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
      .from('tickets')
      .select('*')
      .limit(10000)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[API/tickets GET] Error fetching tickets:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const tickets = (data || []).map(mapRowToTicket);
    return NextResponse.json({ success: true, tickets });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/tickets GET] Exception:', msg);
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

    const ticket = (await request.json()) as Ticket;
    if (!ticket || !ticket.id) {
      return NextResponse.json({ error: 'Données de ticket invalides.' }, { status: 400 });
    }

    const row = mapTicketToRow(ticket);
    const { data: inserted, error } = await db.from('tickets').upsert(row).select().single();
    if (error) {
      console.warn('[API/tickets POST] Error inserting ticket:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const savedTicket = inserted ? mapRowToTicket(inserted) : ticket;
    return NextResponse.json({ success: true, ticket: savedTicket });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/tickets POST] Exception:', msg);
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
      return NextResponse.json({ error: 'ID du ticket requis.' }, { status: 400 });
    }

    const updates = { ...body };
    delete updates.id;

    const row = mapTicketToRow(updates);
    delete row.id;
    row.updated_at = new Date().toISOString();

    const { error } = await db.from('tickets').update(row).eq('id', id);
    if (error) {
      console.warn('[API/tickets PATCH] Error updating ticket:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/tickets PATCH] Exception:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
