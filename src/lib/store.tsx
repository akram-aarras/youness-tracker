'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  tickets: Ticket[];
  payments: PaymentLog[];
  technicians: Technician[];
  isHydrated: boolean;
  language: Language;
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  login: (username: string) => boolean;
  logout: () => void;
  switchRole: (role: Role, techId?: string) => void;
  addClient: (
    client: Omit<Client, 'id' | 'status' | 'lastPaymentDate'> & {
      initialPayment?: boolean;
    }
  ) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  recordPayment: (payment: {
    clientId: string;
    amount?: number;
    baseFee?: number;
    extraAmount?: number;
    extraReason?: string;
    method: PaymentMethod;
    paymentDate: string;
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to calculate days difference from today (2026-10-03 reference or real date)
export function getDaysDiffFromToday(targetDateStr: string): number {
  const target = new Date(targetDateStr);
  // Using today's date from local time context: 2026-10-03
  const today = new Date('2026-10-03T00:00:00Z');
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Compute client status dynamically
export function calculateClientStatus(nextDueDateStr: string): Client['status'] {
  const daysDiff = getDaysDiffFromToday(nextDueDateStr);
  if (daysDiff < 0) {
    if (daysDiff < -14) return 'suspended';
    return 'overdue';
  }
  if (daysDiff <= 3) return 'due_soon';
  return 'active';
}

export function cleanMoroccanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '212' + cleaned.slice(1);
  } else if (!cleaned.startsWith('212')) {
    cleaned = '212' + cleaned;
  }
  return cleaned;
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
    message = `📡 *YounessNet Wi-Fi - Rappel de Facturation & Détail*

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

📍 _Service Client & Support Technique YounessNet_`;
  } else {
    message = `📡 *YounessNet Wi-Fi - Rappel de Facturation*

Salam M. / Mme *${client.name}*,

🔹 *Français :*
Nous vous rappelons que votre abonnement Wi-Fi (*${client.subscriptionPlan || 'Abonnement Standard'}*) d'un montant de *${baseFee} MAD* ${statusPhraseFr}.
Merci de bien vouloir régulariser votre mensualité pour maintenir votre connexion internet active et sans interruption.
Moyens de paiement : Espèces ou Virement CIH / Attijariwafa.

🔹 *الدارجة المغربية :*
سلام سي/لالة *${client.name}*، تفكير ودي بخصوص واجب اشتراك الويفي (*${baseFee} درهم*) لي ${statusPhraseDar}.
شكراً ليك باش تسوي الواجب ف أقرب وقت باش تبقى الكونيكسيون خدامة مزيان وبلا انقطاع.

📍 _Service Client & Support Technique YounessNet_`;
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

  const message = `🧾 *YounessNet Wi-Fi - Reçu de Paiement #${payment.receiptNumber}*

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
📍 _YounessNet Telecom - Tétouan_`;

  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return { url, text: message, cleanPhone };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [payments, setPayments] = useState<PaymentLog[]>(INITIAL_PAYMENTS);
  const [technicians] = useState<Technician[]>(INITIAL_TECHNICIANS);
  const [isHydrated, setIsHydrated] = useState(false);
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

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const STORAGE_SEED_VERSION = 'atlasnet_wisp_v2_empty';
      const storedVersion = localStorage.getItem('atlasnet_seed_version');

      // Check saved language
      const savedLang = localStorage.getItem('atlasnet_language') as Language | null;
      if (savedLang && (savedLang === 'en' || savedLang === 'fr' || savedLang === 'ar')) {
        setLanguageState(savedLang);
        if (typeof document !== 'undefined') {
          document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = savedLang;
        }
      }

      // If version is older or not set, clear legacy mock data from browser storage
      if (storedVersion !== STORAGE_SEED_VERSION) {
        const langToKeep = savedLang || 'fr';
        localStorage.clear();
        localStorage.setItem('atlasnet_seed_version', STORAGE_SEED_VERSION);
        localStorage.setItem('atlasnet_language', langToKeep);
        setClients([]);
        setTickets([]);
        setPayments([]);
        setCurrentUser(INITIAL_USERS[0]);
      } else {
        const storedUser = localStorage.getItem('youness_wisp_user');
        const storedClients = localStorage.getItem('youness_wisp_clients');
        const storedTickets = localStorage.getItem('youness_wisp_tickets');
        const storedPayments = localStorage.getItem('youness_wisp_payments');

        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else {
          // Default to Admin Youness for seamless immediate review
          setCurrentUser(INITIAL_USERS[0]);
        }

        if (storedClients) {
          setClients(JSON.parse(storedClients));
        } else {
          setClients([]);
        }
        if (storedTickets) {
          setTickets(JSON.parse(storedTickets));
        } else {
          setTickets([]);
        }
        if (storedPayments) {
          setPayments(JSON.parse(storedPayments));
        } else {
          setPayments([]);
        }
      }
    } catch (err) {
      console.error('Error loading state from localStorage:', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (currentUser) {
        localStorage.setItem('youness_wisp_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('youness_wisp_user');
      }
      localStorage.setItem('youness_wisp_clients', JSON.stringify(clients));
      localStorage.setItem('youness_wisp_tickets', JSON.stringify(tickets));
      localStorage.setItem('youness_wisp_payments', JSON.stringify(payments));
    } catch (err) {
      console.error('Error saving state to localStorage:', err);
    }
  }, [currentUser, clients, tickets, payments, isHydrated]);

  const login = (username: string): boolean => {
    const found = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim()
    );
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: Role, techId?: string) => {
    if (role === 'admin') {
      const adminUser = users.find((u) => u.role === 'admin') || INITIAL_USERS[0];
      setCurrentUser(adminUser);
    } else {
      const targetTech = users.find((u) =>
        techId ? u.technicianId === techId : u.role === 'technician'
      );
      if (targetTech) {
        setCurrentUser(targetTech);
      }
    }
  };

  const addClient = (
    clientData: Omit<Client, 'id' | 'status' | 'lastPaymentDate'> & {
      initialPayment?: boolean;
    }
  ): Client => {
    const id = `cli-${String(clients.length + 1).padStart(3, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const dueDate = clientData.nextDueDate || todayStr;
    const status = calculateClientStatus(dueDate);

    const safeClientName = clientData.name.trim();
    const cleanUserSlug = safeClientName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Safe fallbacks per requirement
    const safeHardware = {
      antennaModel: clientData.hardware?.antennaModel?.trim() || 'Ubiquiti LiteBeam 5AC',
      antennaMac: clientData.hardware?.antennaMac?.trim().toUpperCase() || 'N/A',
      antennaIp: clientData.hardware?.antennaIp?.trim() || '192.168.10.150',
      routerModel: clientData.hardware?.routerModel?.trim() || 'Standard Router',
      wifiSsid: clientData.hardware?.wifiSsid?.trim() || `${safeClientName}_WiFi`,
      wifiPassword: clientData.hardware?.wifiPassword?.trim() || undefined,
      pppoeUsername:
        clientData.hardware?.pppoeUsername?.trim() ||
        (cleanUserSlug ? `user_${cleanUserSlug}` : 'user_pending'),
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
      monthlyFee: Number(clientData.monthlyFee) > 0 ? Number(clientData.monthlyFee) : 100,
      subscriptionPlan: clientData.subscriptionPlan || 'Standard Wi-Fi Plan (100 MAD)',
      installationDate: clientData.installationDate || todayStr,
      nextDueDate: dueDate,
      lastPaymentDate: clientData.initialPayment
        ? todayStr
        : clientData.installationDate || todayStr,
      hardware: safeHardware,
    };

    setClients((prev) => [newClient, ...prev]);

    if (clientData.initialPayment) {
      const initialFee = newClient.monthlyFee || 100;
      const newPayment: PaymentLog = {
        id: `pay-${Date.now()}`,
        receiptNumber: `REC-2026-${String(payments.length + 101).padStart(4, '0')}`,
        clientId: id,
        clientName: newClient.name,
        amount: initialFee,
        baseFee: initialFee,
        extraAmount: 0,
        method: 'cash',
        paymentDate: todayStr,
        previousDueDate: newClient.installationDate || todayStr,
        newDueDate: newClient.nextDueDate,
        recordedBy: currentUser ? currentUser.name : 'Admin',
        notes: 'Paiement initial frais installation & 1er mois',
      };
      setPayments((prev) => [newPayment, ...prev]);
    }

    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          if (updates.nextDueDate) {
            updated.status = calculateClientStatus(updates.nextDueDate);
          }
          return updated;
        }
        return c;
      })
    );
  };

  const recordPayment = ({
    clientId,
    amount,
    baseFee,
    extraAmount = 0,
    extraReason,
    method,
    paymentDate,
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
    extendDays?: number;
    notes?: string;
    updateClientBaseFee?: boolean;
  }): PaymentLog => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) throw new Error('Client not found');

    const effectiveBaseFee = typeof baseFee === 'number' && baseFee > 0 ? baseFee : (client.monthlyFee || 100);
    const effectiveExtraAmount = typeof extraAmount === 'number' && extraAmount > 0 ? extraAmount : 0;
    const finalAmount = typeof amount === 'number' && amount > 0
      ? amount
      : (effectiveBaseFee + effectiveExtraAmount);

    const prevDueDate = client.nextDueDate;
    // Calculate new due date: 30 days from either current due date or paymentDate (whichever is later)
    const baseDate = new Date(
      new Date(prevDueDate) > new Date(paymentDate) ? prevDueDate : paymentDate
    );
    baseDate.setDate(baseDate.getDate() + extendDays);
    const newDueDate = baseDate.toISOString().split('T')[0];

    const receiptNumber = `REC-2026-${String(payments.length + 947).padStart(4, '0')}`;
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
      paymentDate,
      previousDueDate: prevDueDate,
      newDueDate,
      recordedBy: currentUser ? currentUser.name : 'Admin',
      notes,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update client due date, status, and optionally updated recurring monthly fee
    const clientUpdates: Partial<Client> = {
      lastPaymentDate: paymentDate,
      nextDueDate: newDueDate,
      status: calculateClientStatus(newDueDate),
    };

    if (updateClientBaseFee && effectiveBaseFee > 0) {
      clientUpdates.monthlyFee = effectiveBaseFee;
    }

    updateClient(clientId, clientUpdates);

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
    return newTicket;
  };

  const updateTicketStatus = (
    ticketId: string,
    status: TicketStatus,
    resolutionNote?: string
  ) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            updatedAt: new Date().toISOString(),
            ...(status === 'resolved'
              ? {
                  resolvedAt: new Date().toISOString(),
                  resolutionNote: resolutionNote || t.resolutionNote,
                }
              : {}),
          };
        }
        return t;
      })
    );
  };

  const resetDemoData = () => {
    const currentLang = language;
    localStorage.clear();
    localStorage.setItem('atlasnet_seed_version', 'atlasnet_wisp_v2_empty');
    localStorage.setItem('atlasnet_language', currentLang);
    setClients([]);
    setTickets([]);
    setPayments([]);
    setCurrentUser(INITIAL_USERS[0]);
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
        language,
        dir,
        setLanguage,
        t,
        login,
        logout,
        switchRole,
        addClient,
        updateClient,
        recordPayment,
        createTicket,
        updateTicketStatus,
        resetDemoData,
        getWhatsAppReminderUrl: buildWhatsAppReminder,
        getWhatsAppReceiptUrl: buildWhatsAppReceipt,
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
