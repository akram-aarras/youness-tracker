import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase, isSupabaseConfigured, mapRowToPayment } from '@/lib/supabase';
import { decodeSession, SESSION_COOKIE_NAME, SessionPayload } from '@/lib/auth';
import { PaymentLog, SubscriptionStatus } from '@/lib/types';

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

    // Try payment_logs first (contains all rich columns)
    let res = await db
      .from('payment_logs')
      .select('*')
      .limit(10000)
      .order('payment_date', { ascending: false });

    if (res.error || !res.data || res.data.length === 0) {
      const fallbackRes = await db
        .from('payments')
        .select('*')
        .limit(10000)
        .order('payment_date', { ascending: false });

      if (!fallbackRes.error && fallbackRes.data && fallbackRes.data.length > 0) {
        res = fallbackRes;
      }
    }

    if (res.error) {
      console.warn('[API/payments GET] Error fetching payments:', res.error.message);
      return NextResponse.json({ success: false, error: res.error.message }, { status: 500 });
    }

    const payments = (res.data || []).map(mapRowToPayment);
    return NextResponse.json({ success: true, payments });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/payments GET] Exception:', msg);
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

    const body = await request.json();
    const payment = (body.payment || body) as PaymentLog;
    const clientUpdates = body.clientUpdates as
      | {
          nextDueDate?: string;
          lastPaymentDate?: string;
          status?: SubscriptionStatus;
          monthlyFee?: number;
        }
      | undefined;

    if (!payment || !payment.clientId) {
      return NextResponse.json({ error: 'Données de paiement incomplètes (clientId requis).' }, { status: 400 });
    }

    const paymentId = payment.id || `pay-${Date.now()}`;
    const paymentDate = payment.paymentDate || new Date().toISOString().split('T')[0];
    const amount = Number(payment.amount) || 0;
    const baseFee = payment.baseFee !== undefined ? Number(payment.baseFee) : amount;
    const extraAmount = Number(payment.extraAmount) || 0;
    const receiptNumber = payment.receiptNumber || `REC-${paymentDate.replace(/-/g, '')}-${paymentId.slice(-4)}`;

    // 1. Prepare row for payment_logs table (Strictly omitting billing_month to avoid PGRST204)
    const paymentLogRow = {
      id: paymentId,
      receipt_number: receiptNumber,
      client_id: payment.clientId,
      client_name: payment.clientName,
      amount,
      base_fee: baseFee,
      extra_amount: extraAmount,
      extra_reason: payment.extraReason || null,
      method: payment.method || 'cash',
      payment_date: paymentDate,
      previous_due_date: payment.previousDueDate || paymentDate,
      new_due_date: payment.newDueDate || paymentDate,
      recorded_by: payment.recordedBy || session?.name || 'Admin',
      notes: payment.notes || null,
    };

    // 2. Prepare row for payments table
    const paymentsRow = {
      id: paymentId,
      receipt_number: receiptNumber,
      client_id: payment.clientId,
      client_name: payment.clientName,
      amount,
      payment_method: payment.method || 'cash',
      payment_date: paymentDate,
      collected_by: payment.recordedBy || session?.name || 'Admin',
      notes: payment.notes || null,
    };

    // 3. Persist to payment_logs table
    const { error: logErr } = await db.from('payment_logs').upsert(paymentLogRow);
    if (logErr) {
      console.warn('[API/payments POST] payment_logs insert notice:', logErr.message);
    }

    // 4. Persist to payments table
    const { error: payErr } = await db.from('payments').upsert(paymentsRow);
    if (payErr) {
      console.warn('[API/payments POST] payments insert notice:', payErr.message);
    }

    if (logErr && payErr) {
      return NextResponse.json({ error: logErr.message || payErr.message }, { status: 500 });
    }

    // 5. Update client's due date, last payment date, and status in clients table
    const resolvedNextDueDate = clientUpdates?.nextDueDate || payment.newDueDate;
    const resolvedLastPaymentDate = clientUpdates?.lastPaymentDate || paymentDate;
    const resolvedStatus = clientUpdates?.status;
    const resolvedFee = clientUpdates?.monthlyFee;

    if (resolvedNextDueDate) {
      const clientUpdateRow: Record<string, unknown> = {
        next_due_date: resolvedNextDueDate,
        last_payment_date: resolvedLastPaymentDate,
        updated_at: new Date().toISOString(),
      };
      if (resolvedStatus) clientUpdateRow.status = resolvedStatus;
      if (typeof resolvedFee === 'number' && resolvedFee > 0) clientUpdateRow.monthly_fee = resolvedFee;

      const { error: clientUpdateErr } = await db
        .from('clients')
        .update(clientUpdateRow)
        .eq('id', payment.clientId);

      if (clientUpdateErr) {
        console.warn('[API/payments POST] client due date update notice:', clientUpdateErr.message);
      }
    }

    const savedPayment: PaymentLog = {
      ...payment,
      id: paymentId,
      receiptNumber,
      paymentDate,
      amount,
      baseFee,
      extraAmount,
      billingMonth: paymentDate.substring(0, 7),
    };

    return NextResponse.json({ success: true, payment: savedPayment });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API/payments POST] Exception:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
