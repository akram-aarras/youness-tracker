import { Client, Technician, Ticket, PaymentLog, User } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    username: 'youness',
    name: 'Youness (Owner / NOC Admin)',
    role: 'admin',
    phone: '+212 661-000111',
    avatar: '👨‍💼',
  },
  {
    id: 'user-tech-1',
    username: 'yassine',
    name: 'Yassine (Field Lead)',
    role: 'technician',
    technicianId: 'tech-1',
    phone: '+212 661-234567',
    avatar: '🔧',
  },
  {
    id: 'user-tech-2',
    username: 'omar',
    name: 'Omar (Network Installer)',
    role: 'technician',
    technicianId: 'tech-2',
    phone: '+212 662-890123',
    avatar: '🛠️',
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
