import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  supabase,
  isSupabaseConfigured,
  mapRowToClient,
  mapRowToPayment,
  mapRowToTicket,
} from '@/lib/supabase';
import { Role, User, Technician } from '@/lib/types';

function getDatabaseClient() {
  const admin = getSupabaseAdmin();
  if (admin) return admin;
  if (isSupabaseConfigured && supabase) return supabase;
  return null;
}

export async function GET() {
  try {
    const db = getDatabaseClient();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
    }

    const [clientsRes, payLogsRes, ticketsRes, profilesRes, techsRes] = await Promise.allSettled([
      db.from('clients').select('*').limit(10000).order('created_at', { ascending: false }),
      db.from('payment_logs').select('*').limit(10000).order('payment_date', { ascending: false }),
      db.from('tickets').select('*').limit(10000).order('created_at', { ascending: false }),
      db.from('user_profiles').select('*').limit(10000).order('created_at', { ascending: true }),
      db.from('technicians').select('*').limit(10000).order('created_at', { ascending: true }),
    ]);

    // 1. Clients
    const clients =
      clientsRes.status === 'fulfilled' && !clientsRes.value.error
        ? (clientsRes.value.data || []).map(mapRowToClient)
        : [];

    // 2. Payments (fallback to 'payments' table if payment_logs is empty or errored)
    let payments: ReturnType<typeof mapRowToPayment>[] = [];
    if (payLogsRes.status === 'fulfilled' && !payLogsRes.value.error && payLogsRes.value.data && payLogsRes.value.data.length > 0) {
      payments = payLogsRes.value.data.map(mapRowToPayment);
    } else {
      const { data: fallbackPay } = await db
        .from('payments')
        .select('*')
        .limit(10000)
        .order('payment_date', { ascending: false });
      if (fallbackPay && fallbackPay.length > 0) {
        payments = fallbackPay.map(mapRowToPayment);
      }
    }

    // 3. Tickets
    const tickets =
      ticketsRes.status === 'fulfilled' && !ticketsRes.value.error
        ? (ticketsRes.value.data || []).map(mapRowToTicket)
        : [];

    // 4. Users
    let users: User[] = [];
    if (profilesRes.status === 'fulfilled' && !profilesRes.value.error && profilesRes.value.data && profilesRes.value.data.length > 0) {
      users = profilesRes.value.data.map((row) => {
        const isFieldLead =
          row.role === 'field_lead' ||
          (row.specialty &&
            (row.specialty.toLowerCase().includes('chef') ||
              row.specialty.toLowerCase().includes('lead')));

        const effectiveRole: Role = isFieldLead
          ? 'field_lead'
          : row.role === 'admin'
          ? 'admin'
          : 'technician';

        return {
          id: row.id,
          email: row.email,
          username: row.username,
          name: row.name,
          role: effectiveRole,
          technicianId: row.technician_id,
          phone: row.phone || '',
          avatar: row.avatar || (effectiveRole === 'admin' ? '👨‍💼' : '🔧'),
          status: row.status || 'active',
          specialty: row.specialty,
          createdAt: row.created_at ? String(row.created_at).split('T')[0] : undefined,
        };
      });
    }

    // 5. Technicians
    let technicians: Technician[] = [];
    if (techsRes.status === 'fulfilled' && !techsRes.value.error && techsRes.value.data && techsRes.value.data.length > 0) {
      technicians = techsRes.value.data.map((t) => ({
        id: t.id,
        name: t.name,
        phone: t.phone || '',
        specialty: t.specialty ? t.specialty.replace(/\s*\([^)]*@[^)]*\)/, '').trim() : undefined,
        status: t.status || 'active',
      }));
    }

    return NextResponse.json({
      success: true,
      clients,
      payments,
      tickets,
      users,
      technicians,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/data/sync GET] Exception:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
