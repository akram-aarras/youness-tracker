import { Client, Technician, Ticket, PaymentLog, User } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    email: 'youness@atlasnet.ma',
    username: 'youness',
    name: 'Youness (Owner / NOC Admin)',
    role: 'admin',
    phone: '+212 661-000111',
    avatar: '👨‍💼',
    status: 'active',
    password: 'Admin123!',
    createdAt: '2026-01-01',
  },
  {
    id: 'user-tech-1',
    email: 'yassine@atlasnet.ma',
    username: 'yassine',
    name: 'Yassine El Idrissi',
    role: 'technician',
    technicianId: 'tech-1',
    phone: '+212 661-234567',
    avatar: '🔧',
    status: 'active',
    password: 'Tech123!',
    specialty: 'Antenna Alignment & RF Diagnostics',
    createdAt: '2026-02-01',
  },
  {
    id: 'user-tech-2',
    email: 'omar@atlasnet.ma',
    username: 'omar',
    name: 'Omar Bencheikh',
    role: 'technician',
    technicianId: 'tech-2',
    phone: '+212 662-890123',
    avatar: '🛠️',
    status: 'active',
    password: 'Tech123!',
    specialty: 'Rooftop Mounts & Router Configuration',
    createdAt: '2026-03-01',
  },
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech-1',
    name: 'Yassine El Idrissi',
    phone: '+212 661-234567',
    specialty: 'Antenna Alignment & RF Diagnostics',
    status: 'in_field',
  },
  {
    id: 'tech-2',
    name: 'Omar Bencheikh',
    phone: '+212 662-890123',
    specialty: 'Rooftop Mounts & Router Configuration',
    status: 'active',
  },
];

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_TICKETS: Ticket[] = [];

export const INITIAL_PAYMENTS: PaymentLog[] = [];
