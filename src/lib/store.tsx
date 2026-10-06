'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Client,
  PaymentLog,
  PaymentMethod,
  Role,
  Technician,
  Ticket,
  TicketPriority,
  TicketStatus,
  User,
} from './types';
import {
  INITIAL_CLIENTS,
  INITIAL_PAYMENTS,
  INITIAL_TECHNICIANS,
  INITIAL_TICKETS,
  INITIAL_USERS,
} from './mockData';

import { Language, Translations, getTranslation } from './i18n';
import { encodeSession, SESSION_COOKIE_NAME } from './auth';
import {
  supabase,
  isSupabaseConfigured,
  fetchClientsFromSupabase,
  fetchPaymentsFromSupabase,
  fetchTicketsFromSupabase,
  insertClientToSupabase,
  updateClientInSupabase,
  deleteClientFromSupabase,
  archiveClientInSupabase,
  insertPaymentToSupabase,
  updateClientDueDateInSupabase,
  insertTicketToSupabase,
  updateTicketInSupabase,
  mapRowToClient,
  mapRowToPayment,
  mapRowToTicket,
} from './supabase';

function setClientSessionCookie(user: User) {
  if (typeof document !== 'undefined') {
    const token = encodeSession({
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      technicianId: user.technicianId,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    document.cookie = `${SESSION_COOKIE_NAME}=${token}; path=/; max-age=604800; SameSite=Lax`;
  }
}

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  tickets: Ticket[];
  payments: PaymentLog[];
  technicians: Technician[];
  isHydrated: boolean;
  isOnline: boolean;
  language: Language;
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  hasAdminAccount: boolean;
  login: (
    identifier: string,
    password?: string
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  registerOwner: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  switchRole: (role: Role, techId?: string) => void;
  addUser: (userData: {
    name: string;
    email: string;
    role: Role;
    phone: string;
    specialty?: string;
    password?: string;
  }) => User;
  updateUser: (userId: string, updates: Partial<User>) => void;
  resetUserPassword: (userId: string, newPassword: string) => void;
  updateUserRole: (userId: string, newRole: Role) => void;
  updateUserStatus: (userId: string, status: 'active' | 'inactive') => void;
  deleteUser: (userId: string) => void;
  addClient: (
    client: Omit<Client, 'id' | 'status' | 'lastPaymentDate'> & {
      initialPayment?: boolean;
    }
  ) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (clientId: string) => void;
  archiveClient: (clientId: string) => void;
  exportDataAsJSON: () => string;
  importDataFromJSON: (jsonData: string) => {
    success: boolean;
    error?: string;
    clientsCount?: number;
    ticketsCount?: number;
    paymentsCount?: number;
  };
  recordPayment: (payment: {
    clientId: string;
    amount?: number;
    baseFee?: number;
    extraAmount?: number;
    extraReason?: string;
    method: PaymentMethod;
    paymentDate: string;
    billingMonth?: string;
    extendDays?: number;
    notes?: string;
    updateClientBaseFee?: boolean;
  }) => PaymentLog;
  createTicket: (ticket: {
    clientId: string;
    category: Ticket['category'];
    priority: TicketPriority;
    assignedToTechnicianId: string;
    description: string;
  }) => Ticket;
  updateTicketStatus: (
    ticketId: string,
    status: TicketStatus,
    resolutionNote?: string
  ) => void;
  updateTicket?: (
    ticketId: string,
    updates: Partial<Ticket>
  ) => void;
  refreshFromSupabase: () => Promise<void>;
  isSyncing: boolean;
  resetDemoData: () => void;
  getWhatsAppReminderUrl: (
    client: Client,
    extra?: { amount?: number; reason?: string }
  ) => {
    url: string;
    text: string;
    cleanPhone: string;
  };
  getWhatsAppReceiptUrl: (
    payment: PaymentLog,
    client?: Client
  ) => {
    url: string;
    text: string;
    cleanPhone: string;
  };
  getHistoricalUnpaidReminderUrl: (
    client: Client,
    monthLabel: string
  ) => {
    url: string;
    text: string;
    cleanPhone: string;
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to get today's date in YYYY-MM-DD
export function getTodayDateStr(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Add calendar months safely to a date string YYYY-MM-DD
export function addMonthsToDateStr(dateStr: string, monthsToAdd: number = 1): string {
  if (!dateStr) return getTodayDateStr();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-based month
  const day = parseInt(parts[2], 10);

  const target = new Date(year, month, day);
  target.setMonth(target.getMonth() + monthsToAdd);

  // If day rolled over into next month (e.g. 31 Jan + 1 month -> 3 March in non-leap year)
  // clamp to the last day of the intended month
  const expectedMonth = (month + monthsToAdd) % 12;
  const normalizedExpected = expectedMonth < 0 ? expectedMonth + 12 : expectedMonth;
  if (target.getMonth() !== normalizedExpected) {
    target.setDate(0); // Sets to last day of previous month
  }

  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Helper to calculate days difference from today normalized to midnight (Real-Time Dynamic Sync)
export function getDaysDiffFromToday(targetDateStr: string): number {
  if (!targetDateStr) return 0;
  const parts = targetDateStr.split('-');
  if (parts.length !== 3) return 0;
  const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Generate chronological receipt number: REC-YYYYMMDD-XXXX
export function generateReceiptNumber(seq: number): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const suffix = String(seq).padStart(4, '0');
  return `REC-${yyyy}${mm}${dd}-${suffix}`;
}

// Compute client status dynamically
export function calculateClientStatus(nextDueDateStr: string, currentStatus?: Client['status']): Client['status'] {
  if (currentStatus === 'archived') return 'archived';
  const daysDiff = getDaysDiffFromToday(nextDueDateStr);
  if (daysDiff < 0) {
    if (daysDiff < -14) return 'suspended';
    return 'overdue';
  }
  if (daysDiff <= 3) return 'due_soon';
  return 'active';
}

export function cleanMoroccanPhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('0')) {
    cleaned = '212' + cleaned.slice(1);
  } else if (!cleaned.startsWith('212')) {
    cleaned = '212' + cleaned;
  }
  return cleaned;
}

export function isValidMoroccanPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  return /^(?:(?:0[567]\d{8})|(?:212[567]\d{8}))$/.test(cleaned);
}

export function buildWhatsAppReminder(
  client: Client,
  extra?: { amount?: number; reason?: string }
) {
  const daysDiff = getDaysDiffFromToday(client.nextDueDate);
  const cleanPhone = cleanMoroccanPhoneNumber(client.phone);
  const baseFee = client.monthlyFee || 100;
  const extraAmount = Number(extra?.amount) || 0;
  const extraReason = extra?.reason?.trim() || '';
  const hasExtra = extraAmount > 0;
  const totalAmount = baseFee + extraAmount;

  let statusPhraseFr = `arrive à échéance le ${client.nextDueDate}`;
  let statusPhraseDar = `9riba tsali f ${client.nextDueDate}`;

  if (daysDiff < 0) {
    const overdueDays = Math.abs(daysDiff);
    statusPhraseFr = `est arrivé à échéance depuis ${overdueDays} jour(s) (le ${client.nextDueDate})`;
    statusPhraseDar = `fatet l'échéance dyalo b ${overdueDays} ayam (le ${client.nextDueDate})`;
  } else if (daysDiff === 0) {
    statusPhraseFr = `arrive à échéance AUJOURD'HUI (${client.nextDueDate})`;
    statusPhraseDar = `wslat l'échéance dyalo lyouma (${client.nextDueDate})`;
  }

  let message = '';
  if (hasExtra) {
    message = `📡 *Youness WiFi - Rappel de Facturation & Détail*

Salam M. / Mme *${client.name}*,

🔹 *Français :*
Nous vous rappelons que votre abonnement Wi-Fi (*${client.subscriptionPlan || 'Abonnement Standard'}*) ${statusPhraseFr}.

📋 *Détail de la facture :*
• Abonnement de base : *${baseFee} MAD*
• Frais supplémentaires : *+${extraAmount} MAD* (${extraReason || 'Ajustement'})
━━━━━━━━━━━━━━━━━
💰 *TOTAL À RÉGLER : ${totalAmount} MAD*

Merci de bien vouloir régulariser votre mensualité pour maintenir votre connexion internet active et sans interruption.
Moyens de paiement : Espèces ou Virement CIH / Attijariwafa.

🔹 *الدارجة المغربية :*
سلام سي/لالة *${client.name}*، تفكير ودي بخصوص واجب اشتراك الويفي لي ${statusPhraseDar}.

📋 *تفاصيل الفاتورة الواجب أداؤها :*
• الواجب الشهري : *${baseFee} درهم*
• مصاريف إضافية : *+${extraAmount} درهم* (${extraReason || 'مصاريف إضافية'})
━━━━━━━━━━━━━━━━━
💰 *المجموع الواجب أداؤه : ${totalAmount} درهم*

شكراً ليك باش تسوي الواجب ف أقرب وقت باش تبقى الكونيكسيون خدامة مزيان وبلا انقطاع.

📍 _Service Client & Support Technique Youness WiFi_`;
  } else {
    message = `📡 *Youness WiFi - Rappel de Facturation*

Salam M. / Mme *${client.name}*,

🔹 *Français :*
Nous vous rappelons que votre abonnement Wi-Fi (*${client.subscriptionPlan || 'Abonnement Standard'}*) d'un montant de *${baseFee} MAD* ${statusPhraseFr}.
Merci de bien vouloir régulariser votre mensualité pour maintenir votre connexion internet active et sans interruption.
Moyens de paiement : Espèces ou Virement CIH / Attijariwafa.

🔹 *الدارجة المغربية :*
سلام سي/لالة *${client.name}*، تفكير ودي بخصوص واجب اشتراك الويفي (*${baseFee} درهم*) لي ${statusPhraseDar}.
شكراً ليك باش تسوي الواجب ف أقرب وقت باش تبقى الكونيكسيون خدامة مزيان وبلا انقطاع.

📍 _Service Client & Support Technique Youness WiFi_`;
  }

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return { url, text: message, cleanPhone };
}

export function buildWhatsAppReceipt(
  payment: PaymentLog,
  client?: Client
) {
  const phone = client?.phone || '';
  const cleanPhone = phone ? cleanMoroccanPhoneNumber(phone) : '';
  const baseFee = payment.baseFee || (payment.amount - (payment.extraAmount || 0));
  const hasExtra = (payment.extraAmount || 0) > 0;

  const extraLineFr = hasExtra
    ? `• Frais supplémentaires : *+${payment.extraAmount} MAD* (${payment.extraReason || 'Ajustement'})\n`
    : '';
  const extraLineDar = hasExtra
    ? `• مصاريف إضافية : *+${payment.extraAmount} درهم* (${payment.extraReason || 'مصاريف إضافية'})\n`
    : '';

  const message = `🧾 *Youness WiFi - Reçu de Paiement #${payment.receiptNumber}*

Salam M. / Mme *${payment.clientName}*,

Nous confirmons la bonne réception de votre paiement.

🔹 *Français :*
📋 *Détail du règlement :*
• Abonnement de base : *${baseFee} MAD*
${extraLineFr}━━━━━━━━━━━━━━━━━
💰 *TOTAL RÉGLÉ : ${payment.amount} MAD*
📅 Date : ${payment.paymentDate}
💳 Mode : ${payment.method.toUpperCase().replace('_', ' ')}
🔄 Valide jusqu'au : *${payment.newDueDate}*

🔹 *الدارجة المغربية :*
📋 *تفاصيل الأداء :*
• الواجب الشهري : *${baseFee} درهم*
${extraLineDar}━━━━━━━━━━━━━━━━━
💰 *المجموع المؤدى : ${payment.amount} درهم*
📅 التاريخ : ${payment.paymentDate}
🔄 تاريخ التجديد القادم : *${payment.newDueDate}*

شكراً على وفائكم. اشتراككم مفعل بنجاح وبلا انقطاع!
📍 _Youness WiFi Telecom - Tétouan_`;

  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return { url, text: message, cleanPhone };
}

export const MOROCCAN_ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'ماي',
  'يونيو',
  'يوليوز',
  'غشت',
  'شتنبر',
  'أكتوبر',
  'نونبر',
  'دجنبر',
];

export function formatBillingMonthLabel(monthStr: string, lang: 'ar' | 'fr' | 'en' = 'ar'): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [yearStr, mStr] = monthStr.split('-');
  const monthNum = parseInt(mStr, 10);
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return monthStr;

  if (lang === 'ar') {
    return `${MOROCCAN_ARABIC_MONTHS[monthNum - 1]} ${yearStr}`;
  }
  const date = new Date(parseInt(yearStr, 10), monthNum - 1, 1);
  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });
}

export interface MonthOption {
  value: string;
  labelAr: string;
  labelFr: string;
  isFuture: boolean;
  isCurrent: boolean;
  isPast: boolean;
}

export function getHistoricalMonthList(
  pastCount = 18,
  futureCount = 12
): MonthOption[] {
  const result: MonthOption[] = [];
  const now = new Date();
  const currentY = now.getFullYear();
  const currentM = now.getMonth();
  const currentVal = `${currentY}-${String(currentM + 1).padStart(2, '0')}`;

  // 1. Upcoming future months: +futureCount down to +1 (descending order)
  for (let i = futureCount; i >= 1; i--) {
    const d = new Date(currentY, currentM + i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${month}`;
    result.push({
      value,
      labelAr: formatBillingMonthLabel(value, 'ar'),
      labelFr: formatBillingMonthLabel(value, 'fr'),
      isFuture: true,
      isCurrent: false,
      isPast: false,
    });
  }

  // 2. Current active calendar month
  result.push({
    value: currentVal,
    labelAr: formatBillingMonthLabel(currentVal, 'ar'),
    labelFr: formatBillingMonthLabel(currentVal, 'fr'),
    isFuture: false,
    isCurrent: true,
    isPast: false,
  });

  // 3. Historical past months: -1 down to -pastCount
  for (let i = 1; i <= pastCount; i++) {
    const d = new Date(currentY, currentM - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${month}`;
    result.push({
      value,
      labelAr: formatBillingMonthLabel(value, 'ar'),
      labelFr: formatBillingMonthLabel(value, 'fr'),
      isFuture: false,
      isCurrent: false,
      isPast: true,
    });
  }

  return result;
}

export function buildHistoricalUnpaidReminderUrl(
  client: Client,
  monthLabel: string,
  isFuture: boolean = false
) {
  const cleanPhone = cleanMoroccanPhoneNumber(client.phone);
  const fee = client.monthlyFee || 50;
  const message = isFuture
    ? `السلام عليكم أخي ${client.name}، نود تذكيركم بموعد تجديد اشتراك الإنترنت لشهر ${monthLabel} المقبل (الواجب: ${fee} درهم). يمكنكم الأداء المسبق لتفادي أي انقطاع وشكراً - Youness WiFi`
    : `السلام عليكم أخي ${client.name}، نذكركم بأن اشتراك الإنترنت لشهر ${monthLabel} لم يتم تسديده بعد (المبلغ: ${fee} درهم). المرجو تسوية الواجب وشكراً - Youness WiFi`;
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  return { url, text: message, cleanPhone };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [payments, setPayments] = useState<PaymentLog[]>(INITIAL_PAYMENTS);
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHNICIANS);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [language, setLanguageState] = useState<Language>('fr');

  const dir: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('atlasnet_language', lang);
      if (typeof document !== 'undefined') {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
      }
    } catch (err) {
      console.error('Failed to store language preference:', err);
    }
  };

  const t = (key: keyof Translations, params?: Record<string, string | number>) => {
    return getTranslation(language, key, params);
  };

  // Keep documentElement direction and language in sync
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [dir, language]);

  // Synchronize state with Supabase (Hydration & Multi-Device Sync)
  const refreshFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      setIsSyncing(true);
      const [clientsRes, paymentsRes, ticketsRes] = await Promise.allSettled([
        fetchClientsFromSupabase(),
        fetchPaymentsFromSupabase(),
        fetchTicketsFromSupabase(),
      ]);

      if (clientsRes.status === 'fulfilled' && Array.isArray(clientsRes.value)) {
        setClients(clientsRes.value);
        try {
          localStorage.setItem('youness_wisp_clients', JSON.stringify(clientsRes.value));
        } catch {}
      }

      if (paymentsRes.status === 'fulfilled' && Array.isArray(paymentsRes.value)) {
        setPayments(paymentsRes.value);
        try {
          localStorage.setItem('youness_wisp_payments', JSON.stringify(paymentsRes.value));
        } catch {}
      }

      if (ticketsRes.status === 'fulfilled' && Array.isArray(ticketsRes.value)) {
        setTickets(ticketsRes.value);
        try {
          localStorage.setItem('youness_wisp_tickets', JSON.stringify(ticketsRes.value));
        } catch {}
      }
    } catch (err) {
      console.warn('[Sync] Could not refresh from Supabase:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // 1. Load from localStorage on client mount (Safe, non-destructive parsing)
  // 2. Fetch fresh records from Supabase on startup
  useEffect(() => {
    try {
      // Check saved language
      const savedLang = localStorage.getItem('atlasnet_language') as Language | null;
      if (savedLang && (savedLang === 'en' || savedLang === 'fr' || savedLang === 'ar')) {
        setLanguageState(savedLang);
        if (typeof document !== 'undefined') {
          document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = savedLang;
        }
      }

      // Safe JSON parse helper that protects subscriber records
      const safeParse = <T,>(key: string, fallback: T): T => {
        try {
          const item = localStorage.getItem(key);
          if (!item) return fallback;
          return JSON.parse(item) as T;
        } catch (e) {
          console.warn(`Safe parse fallback for key: ${key}`, e);
          return fallback;
        }
      };

      const storedUser = safeParse<User | null>('youness_wisp_user', null);
      const storedUsers = safeParse<User[]>('youness_wisp_users', INITIAL_USERS);
      const storedTechnicians = safeParse<Technician[]>('youness_wisp_technicians', INITIAL_TECHNICIANS);
      const storedClients = safeParse<Client[]>('youness_wisp_clients', []);
      const storedTickets = safeParse<Ticket[]>('youness_wisp_tickets', []);
      const storedPayments = safeParse<PaymentLog[]>('youness_wisp_payments', []);

      setUsers(storedUsers && storedUsers.length > 0 ? storedUsers : INITIAL_USERS);
      setTechnicians(storedTechnicians && storedTechnicians.length > 0 ? storedTechnicians : INITIAL_TECHNICIANS);
      if (storedUser) {
        setCurrentUser(storedUser);
        setClientSessionCookie(storedUser);
      } else {
        setCurrentUser(null);
      }
      setClients(storedClients || []);
      setTickets(storedTickets || []);
      setPayments(storedPayments || []);
    } catch (err) {
      console.error('Error loading state from localStorage:', err);
    } finally {
      setIsHydrated(true);
    }

    // Hydrate directly from Supabase on application load
    refreshFromSupabase();
  }, [refreshFromSupabase]);

  // Multi-Device Synchronization: Re-sync when user opens or returns to tab on phone or PC
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSyncOnVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshFromSupabase();
      }
    };

    window.addEventListener('focus', handleSyncOnVisible);
    document.addEventListener('visibilitychange', handleSyncOnVisible);

    return () => {
      window.removeEventListener('focus', handleSyncOnVisible);
      document.removeEventListener('visibilitychange', handleSyncOnVisible);
    };
  }, [refreshFromSupabase]);

  // Multi-Device Synchronization: Realtime Postgres changes across devices with INSERT, UPDATE, DELETE support
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('public:all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload: any) => {
          const { eventType, new: newRow, old: oldRow, table } = payload;

          // 1. CLIENTS TABLE
          if (table === 'clients') {
            if (eventType === 'INSERT') {
              if (newRow && newRow.id) {
                const clientObj = mapRowToClient(newRow);
                setClients((prev) => {
                  const filtered = prev.filter((c) => c.id !== clientObj.id);
                  const updated = [clientObj, ...filtered];
                  try {
                    localStorage.setItem('youness_wisp_clients', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              }
            } else if (eventType === 'UPDATE') {
              if (newRow && newRow.id) {
                const clientObj = mapRowToClient(newRow);
                setClients((prev) => {
                  const updated = prev.map((c) => (c.id === clientObj.id ? clientObj : c));
                  try {
                    localStorage.setItem('youness_wisp_clients', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              }
            } else if (eventType === 'DELETE') {
              const deletedId = oldRow?.id;
              if (deletedId) {
                setClients((prev) => {
                  const updated = prev.filter((c) => c.id !== deletedId);
                  try {
                    localStorage.setItem('youness_wisp_clients', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
                setTickets((prev) => {
                  const updated = prev.filter((t) => t.clientId !== deletedId);
                  try {
                    localStorage.setItem('youness_wisp_tickets', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
                setPayments((prev) => {
                  const updated = prev.filter((p) => p.clientId !== deletedId);
                  try {
                    localStorage.setItem('youness_wisp_payments', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              } else {
                refreshFromSupabase();
              }
            }
          }

          // 2. PAYMENT_LOGS / PAYMENTS TABLE
          if (table === 'payment_logs' || table === 'payments') {
            if (eventType === 'INSERT') {
              if (newRow && newRow.id) {
                const paymentObj = mapRowToPayment(newRow);
                setPayments((prev) => {
                  const filtered = prev.filter((p) => p.id !== paymentObj.id);
                  const updated = [paymentObj, ...filtered];
                  try {
                    localStorage.setItem('youness_wisp_payments', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              }
            } else if (eventType === 'UPDATE') {
              if (newRow && newRow.id) {
                const paymentObj = mapRowToPayment(newRow);
                setPayments((prev) => {
                  const updated = prev.map((p) => (p.id === paymentObj.id ? paymentObj : p));
                  try {
                    localStorage.setItem('youness_wisp_payments', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              }
            } else if (eventType === 'DELETE') {
              const deletedId = oldRow?.id;
              if (deletedId) {
                setPayments((prev) => {
                  const updated = prev.filter((p) => p.id !== deletedId);
                  try {
                    localStorage.setItem('youness_wisp_payments', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              } else {
                refreshFromSupabase();
              }
            }
          }

          // 3. TICKETS TABLE
          if (table === 'tickets') {
            if (eventType === 'INSERT') {
              if (newRow && newRow.id) {
                const ticketObj = mapRowToTicket(newRow);
                setTickets((prev) => {
                  const filtered = prev.filter((t) => t.id !== ticketObj.id);
                  const updated = [ticketObj, ...filtered];
                  try {
                    localStorage.setItem('youness_wisp_tickets', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              }
            } else if (eventType === 'UPDATE') {
              if (newRow && newRow.id) {
                const ticketObj = mapRowToTicket(newRow);
                setTickets((prev) => {
                  const updated = prev.map((t) => (t.id === ticketObj.id ? ticketObj : t));
                  try {
                    localStorage.setItem('youness_wisp_tickets', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              }
            } else if (eventType === 'DELETE') {
              const deletedId = oldRow?.id;
              if (deletedId) {
                setTickets((prev) => {
                  const updated = prev.filter((t) => t.id !== deletedId);
                  try {
                    localStorage.setItem('youness_wisp_tickets', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              } else {
                refreshFromSupabase();
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshFromSupabase]);

  // Sync to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (currentUser) {
        localStorage.setItem('youness_wisp_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('youness_wisp_user');
      }
      localStorage.setItem('youness_wisp_users', JSON.stringify(users));
      localStorage.setItem('youness_wisp_technicians', JSON.stringify(technicians));
      localStorage.setItem('youness_wisp_clients', JSON.stringify(clients));
      localStorage.setItem('youness_wisp_tickets', JSON.stringify(tickets));
      localStorage.setItem('youness_wisp_payments', JSON.stringify(payments));
    } catch (err) {
      console.error('Error saving state to localStorage:', err);
    }
  }, [currentUser, users, technicians, clients, tickets, payments, isHydrated]);

  const login = async (
    identifier: string,
    password?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, customUsers: users }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Erreur d'authentification." };
      }
      setCurrentUser(data.user);
      localStorage.setItem('youness_wisp_user', JSON.stringify(data.user));
      setClientSessionCookie(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Login error:', err);
      // Client-side fallback
      const query = identifier.toLowerCase().trim();
      const found = users.find(
        (u) =>
          u.email?.toLowerCase().trim() === query ||
          u.username?.toLowerCase().trim() === query
      );
      if (found) {
        if (found.status === 'inactive') {
          return {
            success: false,
            error: "Compte désactivé. Veuillez contacter le superviseur NOC Youness.",
          };
        }
        if (password && found.password && password !== found.password) {
          return {
            success: false,
            error: "Mot de passe incorrect pour cet utilisateur.",
          };
        }
        setCurrentUser(found);
        localStorage.setItem('youness_wisp_user', JSON.stringify(found));
        setClientSessionCookie(found);
        return { success: true, user: found };
      }
      return { success: false, error: 'Identifiant ou mot de passe non reconnu.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    if (typeof document !== 'undefined') {
      document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    setCurrentUser(null);
    localStorage.removeItem('youness_wisp_user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const switchRole = (role: Role, techId?: string) => {
    if (role === 'admin') {
      const adminUser = users.find((u) => u.role === 'admin') || INITIAL_USERS[0];
      setCurrentUser(adminUser);
      localStorage.setItem('youness_wisp_user', JSON.stringify(adminUser));
      setClientSessionCookie(adminUser);
    } else {
      const targetTech =
        users.find((u) => (techId ? u.technicianId === techId : u.role === 'technician')) ||
        INITIAL_USERS[1];
      setCurrentUser(targetTech);
      localStorage.setItem('youness_wisp_user', JSON.stringify(targetTech));
      setClientSessionCookie(targetTech);
    }
  };

  const registerOwner = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const email = data.email.toLowerCase().trim();
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
      const name = data.name.trim() || 'Youness (Owner / NOC Admin)';
      const phone = data.phone?.trim() || '+212 661-000111';
      const password = data.password.trim();

      if (!email || !password) {
        return { success: false, error: 'Email et mot de passe obligatoires.' };
      }

      const adminUser: User = {
        id: 'user-admin',
        email,
        username,
        name,
        role: 'admin',
        phone,
        avatar: '👨‍💼',
        status: 'active',
        password,
        createdAt: new Date().toISOString().split('T')[0],
      };

      const otherUsers = users.filter((u) => u.role !== 'admin' && u.id !== 'user-admin');
      const updatedUsers = [adminUser, ...otherUsers];

      setUsers(updatedUsers);
      setCurrentUser(adminUser);
      localStorage.setItem('youness_wisp_users', JSON.stringify(updatedUsers));
      localStorage.setItem('youness_wisp_user', JSON.stringify(adminUser));
      setClientSessionCookie(adminUser);

      return { success: true, user: adminUser };
    } catch (err) {
      console.error('registerOwner error:', err);
      return { success: false, error: "Erreur lors de l'enregistrement de l'administrateur." };
    }
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...updates };
          if (updated.technicianId) {
            setTechnicians((tPrev) =>
              tPrev.map((t) => {
                if (t.id === updated.technicianId) {
                  return {
                    ...t,
                    name: updated.name || t.name,
                    phone: updated.phone || t.phone,
                    specialty: updated.specialty || t.specialty,
                  };
                }
                return t;
              })
            );
          }
          return updated;
        }
        return u;
      })
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const resetUserPassword = (userId: string, newPassword: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPassword.trim() } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, password: newPassword.trim() } : null));
    }
  };

  const addUser = (userData: {
    name: string;
    email: string;
    role: Role;
    phone: string;
    specialty?: string;
    password?: string;
  }): User => {
    const id = `user-${userData.role === 'admin' ? 'admin' : 'tech'}-${Date.now().toString().slice(-4)}`;
    const username = userData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
    const avatar = userData.role === 'admin' ? '👨‍💼' : '🔧';

    let technicianId: string | undefined = undefined;
    if (userData.role === 'technician' || userData.role === 'field_lead') {
      technicianId = `tech-${technicians.length + 1}`;
      const newTech: Technician = {
        id: technicianId,
        name: userData.name.trim(),
        phone: userData.phone.trim(),
        specialty: userData.specialty?.trim() || (userData.role === 'field_lead' ? 'Chef d\'Équipe Terrain' : 'Technicien Réseau & Câblage'),
        status: 'active',
      };
      setTechnicians((prev) => [...prev, newTech]);
    }

    const newUser: User = {
      id,
      email: userData.email.toLowerCase().trim(),
      username,
      name: userData.name.trim(),
      role: userData.role,
      technicianId,
      phone: userData.phone.trim(),
      avatar,
      status: 'active',
      password: userData.password || 'Tech123!',
      specialty: userData.specialty?.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUserRole = (userId: string, newRole: Role) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, role: newRole };
          if ((newRole === 'technician' || newRole === 'field_lead') && !updated.technicianId) {
            updated.technicianId = `tech-${technicians.length + 1}`;
            setTechnicians((tPrev) => [
              ...tPrev,
              {
                id: updated.technicianId!,
                name: updated.name,
                phone: updated.phone,
                specialty: updated.specialty || (newRole === 'field_lead' ? 'Chef d\'Équipe Terrain' : 'Technicien Réseau'),
                status: 'active',
              },
            ]);
          }
          return updated;
        }
        return u;
      })
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
  };

  const updateUserStatus = (userId: string, status: 'active' | 'inactive') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    if (currentUser?.id === userId && status === 'inactive') {
      logout();
    }
  };

  const deleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (userToDelete?.technicianId) {
      setTechnicians((prev) => prev.filter((t) => t.id !== userToDelete.technicianId));
    }
  };

  const deleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    setTickets((prev) => prev.filter((t) => t.clientId !== clientId));
    setPayments((prev) => prev.filter((p) => p.clientId !== clientId));
    deleteClientFromSupabase(clientId).catch((err) => {
      console.warn('[Supabase] Failed to delete client:', err);
    });
  };

  const archiveClient = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, status: 'archived' } : c))
    );
    archiveClientInSupabase(clientId).catch((err) => {
      console.warn('[Supabase] Failed to archive client:', err);
    });
  };

  const exportDataAsJSON = (): string => {
    const backup = {
      brand: 'Youness WiFi',
      version: '1.0',
      exportDate: new Date().toISOString(),
      clients,
      payments,
      tickets,
      users,
      technicians,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataFromJSON = (
    jsonData: string
  ): {
    success: boolean;
    error?: string;
    clientsCount?: number;
    ticketsCount?: number;
    paymentsCount?: number;
  } => {
    try {
      const data = JSON.parse(jsonData);
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Format de fichier JSON invalide.' };
      }
      let cCount = 0;
      let pCount = 0;
      let tCount = 0;
      if (Array.isArray(data.clients)) {
        setClients(data.clients);
        cCount = data.clients.length;
      }
      if (Array.isArray(data.payments)) {
        setPayments(data.payments);
        pCount = data.payments.length;
      }
      if (Array.isArray(data.tickets)) {
        setTickets(data.tickets);
        tCount = data.tickets.length;
      }
      if (Array.isArray(data.users) && data.users.length > 0) setUsers(data.users);
      if (Array.isArray(data.technicians) && data.technicians.length > 0) setTechnicians(data.technicians);
      return {
        success: true,
        clientsCount: cCount,
        ticketsCount: tCount,
        paymentsCount: pCount,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la lecture du fichier JSON.';
      return { success: false, error: errorMsg };
    }
  };

  const addClient = (
    clientData: Omit<Client, 'id' | 'status' | 'lastPaymentDate'> & {
      initialPayment?: boolean;
    }
  ): Client => {
    const id = `cli-${String(clients.length + 1).padStart(3, '0')}`;
    const todayStr = getTodayDateStr();
    const dueDate = clientData.nextDueDate || addMonthsToDateStr(todayStr, 1);
    const status = calculateClientStatus(dueDate);

    const safeClientName = clientData.name.trim();
    const cleanUserSlug = safeClientName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '').replace(/_+/g, '_');
    const autoPppoeUser = cleanUserSlug ? `user_${cleanUserSlug}` : `client_${id.replace('cli-', '')}`;
    const autoSsid = cleanUserSlug ? `${safeClientName.split(' ')[0]}_WiFi` : `WiFi_${id.replace('cli-', '')}`;

    // Safe fallbacks per requirement
    const safeHardware = {
      antennaModel: clientData.hardware?.antennaModel?.trim() || 'Ubiquiti LiteBeam 5AC',
      antennaMac: clientData.hardware?.antennaMac?.trim().toUpperCase() || 'N/A',
      antennaIp: clientData.hardware?.antennaIp?.trim() || '192.168.10.150',
      routerModel: clientData.hardware?.routerModel?.trim() || 'Standard Router',
      wifiSsid: clientData.hardware?.wifiSsid?.trim() || autoSsid,
      wifiPassword: clientData.hardware?.wifiPassword?.trim() || undefined,
      pppoeUsername: clientData.hardware?.pppoeUsername?.trim() || autoPppoeUser,
      pppoePassword: clientData.hardware?.pppoePassword?.trim() || '123456',
      signalStrengthDbm:
        typeof clientData.hardware?.signalStrengthDbm === 'number' && !isNaN(clientData.hardware.signalStrengthDbm)
          ? clientData.hardware.signalStrengthDbm
          : -65,
      sectorTower: clientData.hardware?.sectorTower?.trim() || 'Tour Boujarah (Relais Centre)',
    };

    const newClient: Client = {
      ...clientData,
      id,
      name: safeClientName,
      phone: clientData.phone.trim(),
      neighborhood: clientData.neighborhood?.trim() || 'Wilaya',
      address: clientData.address?.trim() || 'Tétouan',
      googleMapsUrl:
        clientData.googleMapsUrl?.trim() || 'https://maps.google.com/?q=35.5784,-5.3684',
      status,
      monthlyFee: Number(clientData.monthlyFee) > 0 ? Number(clientData.monthlyFee) : 50,
      subscriptionPlan: clientData.subscriptionPlan || 'باقة اقتصادية - 50 د.م./شهر (Pack Éco 50 MAD)',
      installationDate: clientData.installationDate || todayStr,
      nextDueDate: dueDate,
      lastPaymentDate: clientData.initialPayment
        ? todayStr
        : undefined,
      hardware: safeHardware,
    };

    setClients((prev) => [newClient, ...prev]);

    // Supabase mutation: insert client into clients table
    insertClientToSupabase(newClient).catch((err) => {
      console.warn('[Supabase] Failed to insert client to DB:', err);
    });

    if (clientData.initialPayment) {
      const initialFee = newClient.monthlyFee || 50;
      const newPayment: PaymentLog = {
        id: `pay-${Date.now()}`,
        receiptNumber: generateReceiptNumber(payments.length + 1),
        clientId: id,
        clientName: newClient.name,
        amount: initialFee,
        baseFee: initialFee,
        extraAmount: 0,
        method: 'cash',
        paymentDate: todayStr,
        billingMonth: todayStr.substring(0, 7),
        previousDueDate: newClient.installationDate || todayStr,
        newDueDate: newClient.nextDueDate,
        recordedBy: currentUser ? currentUser.name : 'Admin',
        notes: 'Paiement initial frais installation & 1er mois',
      };
      setPayments((prev) => [newPayment, ...prev]);

      // Supabase mutation: insert initial payment into payments table
      insertPaymentToSupabase(newPayment).catch((err) => {
        console.warn('[Supabase] Failed to insert initial payment to DB:', err);
      });
    }

    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    let resolvedUpdates: Partial<Client> = { ...updates };
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          if (updates.nextDueDate || updates.status) {
            updated.status = calculateClientStatus(updated.nextDueDate, updated.status);
          }
          resolvedUpdates = updated;
          return updated;
        }
        return c;
      })
    );

    // Supabase mutation: update client in database
    updateClientInSupabase(id, resolvedUpdates).catch((err) => {
      console.warn('[Supabase] Failed to update client in DB:', err);
    });
  };

  const recordPayment = ({
    clientId,
    amount,
    baseFee,
    extraAmount = 0,
    extraReason,
    method,
    paymentDate,
    billingMonth,
    extendDays = 30,
    notes,
    updateClientBaseFee = false,
  }: {
    clientId: string;
    amount?: number;
    baseFee?: number;
    extraAmount?: number;
    extraReason?: string;
    method: PaymentMethod;
    paymentDate: string;
    billingMonth?: string;
    extendDays?: number;
    notes?: string;
    updateClientBaseFee?: boolean;
  }): PaymentLog => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) throw new Error('Client not found');

    const rawBase = typeof baseFee === 'number' && !isNaN(baseFee) ? baseFee : (client.monthlyFee || 50);
    const effectiveBaseFee = Math.max(0, rawBase);
    const rawExtra = typeof extraAmount === 'number' && !isNaN(extraAmount) ? extraAmount : 0;
    const effectiveExtraAmount = Math.max(0, rawExtra);
    const finalAmount = typeof amount === 'number' && !isNaN(amount) && amount > 0
      ? Math.max(0, amount)
      : (effectiveBaseFee + effectiveExtraAmount);

    // Calculate new due date: advance from previous due date by proper calendar month(s) to cover unpaid period!
    const prevDueDate = client.nextDueDate;
    const monthsToAdd = Math.max(1, Math.round(extendDays / 30));
    const newDueDate = addMonthsToDateStr(prevDueDate, monthsToAdd);

    const receiptNumber = generateReceiptNumber(payments.length + 1);
    const resolvedPaymentDate = paymentDate || getTodayDateStr();
    const resolvedBillingMonth = billingMonth || resolvedPaymentDate.substring(0, 7);
    const newPayment: PaymentLog = {
      id: `pay-${Date.now()}`,
      receiptNumber,
      clientId,
      clientName: client.name,
      amount: finalAmount,
      baseFee: effectiveBaseFee,
      extraAmount: effectiveExtraAmount,
      extraReason: effectiveExtraAmount > 0 ? (extraReason?.trim() || undefined) : undefined,
      method,
      paymentDate: resolvedPaymentDate,
      billingMonth: resolvedBillingMonth,
      previousDueDate: prevDueDate,
      newDueDate,
      recordedBy: currentUser ? currentUser.name : 'Admin',
      notes,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update client due date, status, and optionally updated recurring monthly fee
    const updatedStatus = calculateClientStatus(newDueDate);
    const clientUpdates: Partial<Client> = {
      lastPaymentDate: resolvedPaymentDate,
      nextDueDate: newDueDate,
      status: updatedStatus,
    };

    if (updateClientBaseFee && effectiveBaseFee > 0) {
      clientUpdates.monthlyFee = effectiveBaseFee;
    }

    updateClient(clientId, clientUpdates);

    // Supabase mutations:
    // 1. Insert payment transaction into Supabase payments table
    insertPaymentToSupabase(newPayment).catch((err) => {
      console.warn('[Supabase] Failed to insert payment to DB:', err);
    });

    // 2. Update nextDueDate & status on client table in Supabase
    updateClientDueDateInSupabase(
      clientId,
      newDueDate,
      resolvedPaymentDate,
      updatedStatus,
      updateClientBaseFee ? effectiveBaseFee : undefined
    ).catch((err) => {
      console.warn('[Supabase] Failed to update client due date in DB:', err);
    });

    return newPayment;
  };

  const createTicket = ({
    clientId,
    category,
    priority,
    assignedToTechnicianId,
    description,
  }: {
    clientId: string;
    category: Ticket['category'];
    priority: TicketPriority;
    assignedToTechnicianId: string;
    description: string;
  }): Ticket => {
    const client = clients.find((c) => c.id === clientId);
    const tech = technicians.find((t) => t.id === assignedToTechnicianId);

    const ticketNumber = `TCK-${100 + tickets.length + 1}`;
    const newTicket: Ticket = {
      id: `tck-${Date.now()}`,
      ticketNumber,
      clientId,
      clientName: client ? client.name : 'Unknown Client',
      clientPhone: client ? client.phone : '',
      clientNeighborhood: client?.neighborhood || 'Tétouan',
      clientAddress: client?.address || '',
      googleMapsUrl: client?.googleMapsUrl || 'https://maps.google.com/?q=35.5784,-5.3684',
      category,
      priority,
      status: 'open',
      assignedToTechnicianId,
      assignedTechnicianName: tech ? tech.name.split(' ')[0] : 'Unassigned',
      description,
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Supabase mutation: insert ticket into Supabase tickets table
    insertTicketToSupabase(newTicket).catch((err) => {
      console.warn('[Supabase] Failed to insert ticket to DB:', err);
    });

    return newTicket;
  };

  const updateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    let resolvedUpdates = { ...updates };
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updated = {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          resolvedUpdates = updated;
          return updated;
        }
        return t;
      })
    );

    // Supabase mutation: update ticket in Supabase tickets table
    updateTicketInSupabase(ticketId, resolvedUpdates).catch((err) => {
      console.warn('[Supabase] Failed to update ticket in DB:', err);
    });
  };

  const updateTicketStatus = (
    ticketId: string,
    status: TicketStatus,
    resolutionNote?: string
  ) => {
    const updates: Partial<Ticket> = {
      status,
      updatedAt: new Date().toISOString(),
      ...(status === 'resolved'
        ? {
            resolvedAt: new Date().toISOString(),
            resolutionNote: resolutionNote,
          }
        : {}),
    };
    updateTicket(ticketId, updates);
  };

  const resetDemoData = () => {
    const currentLang = language;
    localStorage.removeItem('youness_wisp_clients');
    localStorage.removeItem('youness_wisp_tickets');
    localStorage.removeItem('youness_wisp_payments');
    setClients([]);
    setTickets([]);
    setPayments([]);
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        clients,
        tickets,
        payments,
        technicians,
        isHydrated,
        isSyncing,
        isOnline,
        language,
        dir,
        hasAdminAccount: users.some((u) => u.role === 'admin'),
        setLanguage,
        t,
        login,
        logout,
        registerOwner,
        switchRole,
        addUser,
        updateUser,
        resetUserPassword,
        updateUserRole,
        updateUserStatus,
        deleteUser,
        addClient,
        updateClient,
        deleteClient,
        archiveClient,
        exportDataAsJSON,
        importDataFromJSON,
        recordPayment,
        createTicket,
        updateTicket,
        updateTicketStatus,
        refreshFromSupabase,
        resetDemoData,
        getWhatsAppReminderUrl: buildWhatsAppReminder,
        getWhatsAppReceiptUrl: buildWhatsAppReceipt,
        getHistoricalUnpaidReminderUrl: buildHistoricalUnpaidReminderUrl,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
