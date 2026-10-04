export type Role = 'admin' | 'technician';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  technicianId?: string;
  phone: string;
  avatar: string;
}

export type SubscriptionStatus = 'active' | 'due_soon' | 'overdue' | 'suspended';

export interface HardwareDetails {
  antennaModel?: string;
  antennaMac?: string;
  antennaIp?: string;
  routerModel?: string;
  wifiSsid?: string;
  wifiPassword?: string;
  pppoeUsername?: string;
  pppoePassword?: string;
  signalStrengthDbm?: number;
  sectorTower?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  neighborhood?: string;
  address?: string;
  gpsCoordinates?: string;
  googleMapsUrl?: string;
  status: SubscriptionStatus;
  monthlyFee: number; // In Moroccan Dirham (MAD / DH)
  subscriptionPlan?: string;
  nextDueDate: string; // YYYY-MM-DD
  lastPaymentDate?: string; // YYYY-MM-DD
  installationDate?: string; // YYYY-MM-DD
  hardware: HardwareDetails;
  notes?: string;
}

export type TicketCategory =
  | 'no_internet'
  | 'weak_signal'
  | 'power_adapter'
  | 'new_installation'
  | 'router_config';

export type TicketPriority = 'urgent' | 'high' | 'normal';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface Ticket {
  id: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientNeighborhood?: string;
  clientAddress?: string;
  googleMapsUrl?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedToTechnicianId: string;
  assignedTechnicianName: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'cih_bank' | 'wafacash';

export interface PaymentLog {
  id: string;
  receiptNumber: string;
  clientId: string;
  clientName: string;
  amount: number; // in MAD (Total collected = baseFee + extraAmount)
  baseFee?: number; // Base monthly subscription fee (Default: 100 MAD or custom)
  extraAmount?: number; // Extra charges / adjustments (Default: 0)
  extraReason?: string; // Reason / description for extra charge
  method: PaymentMethod;
  paymentDate: string;
  previousDueDate: string;
  newDueDate: string;
  recordedBy: string;
  notes?: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  status: 'active' | 'in_field' | 'off_duty';
}
