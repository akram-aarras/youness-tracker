import { createClient } from '@supabase/supabase-js';
import { Client, PaymentLog, Ticket, SubscriptionStatus, TicketCategory, TicketPriority, TicketStatus, PaymentMethod } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// ============================================================================
// Bidirectional Mappers (Snake_Case Postgres <-> CamelCase App State)
// ============================================================================

export function mapRowToClient(row: Record<string, any>): Client {
  return {
    id: row.id,
    name: row.name || '',
    phone: row.phone || '',
    neighborhood: row.neighborhood || undefined,
    address: row.address || undefined,
    gpsCoordinates: row.gps_coordinates || undefined,
    googleMapsUrl: row.google_maps_url || undefined,
    status: (row.status as SubscriptionStatus) || 'active',
    monthlyFee: Number(row.monthly_fee) || 50,
    subscriptionPlan: row.subscription_plan || undefined,
    nextDueDate: row.next_due_date ? String(row.next_due_date).split('T')[0] : '',
    lastPaymentDate: row.last_payment_date ? String(row.last_payment_date).split('T')[0] : undefined,
    installationDate: row.installation_date ? String(row.installation_date).split('T')[0] : undefined,
    hardware: typeof row.hardware === 'object' && row.hardware !== null ? row.hardware : {},
    notes: row.notes || undefined,
  };
}

export function mapClientToRow(client: Partial<Client>): Record<string, any> {
  const row: Record<string, any> = {};
  if (client.id !== undefined) row.id = client.id;
  if (client.name !== undefined) row.name = client.name;
  if (client.phone !== undefined) row.phone = client.phone;
  if (client.neighborhood !== undefined) row.neighborhood = client.neighborhood;
  if (client.address !== undefined) row.address = client.address;
  if (client.gpsCoordinates !== undefined) row.gps_coordinates = client.gpsCoordinates;
  if (client.googleMapsUrl !== undefined) row.google_maps_url = client.googleMapsUrl;
  if (client.status !== undefined) row.status = client.status;
  if (client.monthlyFee !== undefined) row.monthly_fee = client.monthlyFee;
  if (client.subscriptionPlan !== undefined) row.subscription_plan = client.subscriptionPlan;
  if (client.nextDueDate !== undefined) row.next_due_date = client.nextDueDate;
  if (client.lastPaymentDate !== undefined) row.last_payment_date = client.lastPaymentDate || null;
  if (client.installationDate !== undefined) row.installation_date = client.installationDate || null;
  if (client.hardware !== undefined) row.hardware = client.hardware;
  if (client.notes !== undefined) row.notes = client.notes;
  row.updated_at = new Date().toISOString();
  return row;
}

export function mapRowToPayment(row: Record<string, any>): PaymentLog {
  const paymentDate = row.payment_date ? String(row.payment_date).split('T')[0] : '';
  return {
    id: row.id,
    receiptNumber: row.receipt_number || '',
    clientId: row.client_id || '',
    clientName: row.client_name || '',
    amount: Number(row.amount) || 0,
    baseFee: row.base_fee !== null && row.base_fee !== undefined ? Number(row.base_fee) : undefined,
    extraAmount: row.extra_amount !== null && row.extra_amount !== undefined ? Number(row.extra_amount) : 0,
    extraReason: row.extra_reason || undefined,
    method: (row.method as PaymentMethod) || 'cash',
    paymentDate,
    billingMonth: row.billing_month || (paymentDate ? paymentDate.substring(0, 7) : undefined),
    previousDueDate: row.previous_due_date ? String(row.previous_due_date).split('T')[0] : '',
    newDueDate: row.new_due_date ? String(row.new_due_date).split('T')[0] : '',
    recordedBy: row.recorded_by || 'Admin',
    notes: row.notes || undefined,
  };
}

export function mapPaymentToRow(payment: PaymentLog): Record<string, any> {
  return {
    id: payment.id,
    receipt_number: payment.receiptNumber,
    client_id: payment.clientId,
    client_name: payment.clientName,
    amount: payment.amount,
    base_fee: payment.baseFee ?? payment.amount,
    extra_amount: payment.extraAmount ?? 0,
    extra_reason: payment.extraReason || null,
    method: payment.method,
    payment_date: payment.paymentDate,
    billing_month: payment.billingMonth || payment.paymentDate?.substring(0, 7),
    previous_due_date: payment.previousDueDate,
    new_due_date: payment.newDueDate,
    recorded_by: payment.recordedBy,
    notes: payment.notes || null,
  };
}

export function mapRowToTicket(row: Record<string, any>): Ticket {
  return {
    id: row.id,
    ticketNumber: row.ticket_number || '',
    clientId: row.client_id || '',
    clientName: row.client_name || '',
    clientPhone: row.client_phone || '',
    clientNeighborhood: row.client_neighborhood || undefined,
    clientAddress: row.client_address || undefined,
    googleMapsUrl: row.google_maps_url || undefined,
    category: (row.category as TicketCategory) || 'no_internet',
    priority: (row.priority as TicketPriority) || 'normal',
    status: (row.status as TicketStatus) || 'open',
    assignedToTechnicianId: row.assigned_to_technician_id || '',
    assignedTechnicianName: row.assigned_technician_name || '',
    description: row.description || '',
    resolutionNote: row.resolution_note || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || undefined,
    resolvedAt: row.resolved_at || undefined,
  };
}

export function mapTicketToRow(ticket: Partial<Ticket>): Record<string, any> {
  const row: Record<string, any> = {};
  if (ticket.id !== undefined) row.id = ticket.id;
  if (ticket.ticketNumber !== undefined) row.ticket_number = ticket.ticketNumber;
  if (ticket.clientId !== undefined) row.client_id = ticket.clientId || null;
  if (ticket.clientName !== undefined) row.client_name = ticket.clientName;
  if (ticket.clientPhone !== undefined) row.client_phone = ticket.clientPhone;
  if (ticket.clientNeighborhood !== undefined) row.client_neighborhood = ticket.clientNeighborhood || null;
  if (ticket.clientAddress !== undefined) row.client_address = ticket.clientAddress || null;
  if (ticket.googleMapsUrl !== undefined) row.google_maps_url = ticket.googleMapsUrl || null;
  if (ticket.category !== undefined) row.category = ticket.category;
  if (ticket.priority !== undefined) row.priority = ticket.priority;
  if (ticket.status !== undefined) row.status = ticket.status;
  if (ticket.assignedToTechnicianId !== undefined) row.assigned_to_technician_id = ticket.assignedToTechnicianId || null;
  if (ticket.assignedTechnicianName !== undefined) row.assigned_technician_name = ticket.assignedTechnicianName || null;
  if (ticket.description !== undefined) row.description = ticket.description;
  if (ticket.resolutionNote !== undefined) row.resolution_note = ticket.resolutionNote || null;
  if (ticket.createdAt !== undefined) row.created_at = ticket.createdAt;
  if (ticket.updatedAt !== undefined) row.updated_at = ticket.updatedAt;
  if (ticket.resolvedAt !== undefined) row.resolved_at = ticket.resolvedAt || null;
  return row;
}

// ============================================================================
// Asynchronous Supabase Fetch Helpers
// ============================================================================

export async function fetchClientsFromSupabase(): Promise<Client[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] fetchClients failed:', error.message);
      return null;
    }
    return (data || []).map(mapRowToClient);
  } catch (err) {
    console.warn('[Supabase] fetchClients exception:', err);
    return null;
  }
}

export async function fetchPaymentsFromSupabase(): Promise<PaymentLog[] | null> {
  if (!supabase) return null;
  try {
    // Try 'payments' view / table first
    let res = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (res.error && (res.error.message.includes('schema cache') || res.error.message.includes('Could not find') || res.error.code === 'PGRST205')) {
      // Fallback to 'payment_logs' table
      res = await supabase
        .from('payment_logs')
        .select('*')
        .order('created_at', { ascending: false });
    }

    if (res.error) {
      console.warn('[Supabase] fetchPayments failed:', res.error.message);
      return null;
    }
    return (res.data || []).map(mapRowToPayment);
  } catch (err) {
    console.warn('[Supabase] fetchPayments exception:', err);
    return null;
  }
}

export async function fetchTicketsFromSupabase(): Promise<Ticket[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] fetchTickets failed:', error.message);
      return null;
    }
    return (data || []).map(mapRowToTicket);
  } catch (err) {
    console.warn('[Supabase] fetchTickets exception:', err);
    return null;
  }
}

// ============================================================================
// Asynchronous Supabase Mutation Helpers
// ============================================================================

export async function insertClientToSupabase(client: Client): Promise<boolean> {
  if (!supabase) return false;
  try {
    const row = mapClientToRow(client);
    const { error } = await supabase.from('clients').upsert(row);
    if (error) {
      console.warn('[Supabase] insertClient failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] insertClient exception:', err);
    return false;
  }
}

export async function updateClientInSupabase(id: string, updates: Partial<Client>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const row = mapClientToRow(updates);
    const { error } = await supabase.from('clients').update(row).eq('id', id);
    if (error) {
      console.warn('[Supabase] updateClient failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] updateClient exception:', err);
    return false;
  }
}

export async function deleteClientFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase] deleteClient failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] deleteClient exception:', err);
    return false;
  }
}

export async function archiveClientInSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('clients')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.warn('[Supabase] archiveClient failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] archiveClient exception:', err);
    return false;
  }
}

export async function insertPaymentToSupabase(payment: PaymentLog): Promise<boolean> {
  if (!supabase) return false;
  try {
    const row = mapPaymentToRow(payment);
    // Try 'payments' first
    let res = await supabase.from('payments').insert(row);
    if (res.error && (res.error.message.includes('schema cache') || res.error.message.includes('Could not find') || res.error.code === 'PGRST205')) {
      // Fallback to 'payment_logs'
      res = await supabase.from('payment_logs').insert(row);
    }
    if (res.error) {
      console.warn('[Supabase] insertPayment failed:', res.error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] insertPayment exception:', err);
    return false;
  }
}

export async function updateClientDueDateInSupabase(
  clientId: string,
  nextDueDate: string,
  lastPaymentDate: string,
  status: SubscriptionStatus,
  monthlyFee?: number
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const updates: Record<string, any> = {
      next_due_date: nextDueDate,
      last_payment_date: lastPaymentDate,
      status,
      updated_at: new Date().toISOString(),
    };
    if (typeof monthlyFee === 'number' && monthlyFee > 0) {
      updates.monthly_fee = monthlyFee;
    }
    const { error } = await supabase.from('clients').update(updates).eq('id', clientId);
    if (error) {
      console.warn('[Supabase] updateClientDueDate failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] updateClientDueDate exception:', err);
    return false;
  }
}

export async function insertTicketToSupabase(ticket: Ticket): Promise<boolean> {
  if (!supabase) return false;
  try {
    const row = mapTicketToRow(ticket);
    const { error } = await supabase.from('tickets').insert(row);
    if (error) {
      console.warn('[Supabase] insertTicket failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] insertTicket exception:', err);
    return false;
  }
}

export async function updateTicketInSupabase(ticketId: string, updates: Partial<Ticket>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const row = mapTicketToRow(updates);
    const { error } = await supabase.from('tickets').update(row).eq('id', ticketId);
    if (error) {
      console.warn('[Supabase] updateTicket failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] updateTicket exception:', err);
    return false;
  }
}
