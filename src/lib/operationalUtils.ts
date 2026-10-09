import type { Client, PaymentLog, SubscriptionStatus } from './types';

// Format: YYYY-MM-DD
export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addMonthsToDateStr(dateStr: string, monthsToAdd: number = 1): string {
  if (!dateStr || !dateStr.includes('-')) {
    const today = new Date();
    today.setMonth(today.getMonth() + monthsToAdd);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  const targetDay = parseInt(dayStr, 10);

  // Advance month
  month += monthsToAdd;
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }

  // Handle month length overflow
  const maxDays = new Date(year, month, 0).getDate();
  const finalDay = Math.min(targetDay, maxDays);

  const mm = String(month).padStart(2, '0');
  const dd = String(finalDay).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function getDaysDiffFromToday(
  targetDateStr: string,
  referenceDateInput?: string | Date
): number {
  if (!targetDateStr) return 0;
  const target = new Date(`${targetDateStr}T00:00:00`);
  let ref: Date;
  if (!referenceDateInput) {
    ref = new Date();
    ref.setHours(0, 0, 0, 0);
  } else if (typeof referenceDateInput === 'string') {
    ref = new Date(`${referenceDateInput}T00:00:00`);
  } else {
    ref = new Date(referenceDateInput);
    ref.setHours(0, 0, 0, 0);
  }

  const diffTime = target.getTime() - ref.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateClientStatus(
  nextDueDate: string,
  currentStatus?: Client['status'],
  referenceDateInput?: string | Date
): Client['status'] {
  if (currentStatus === 'archived') return 'archived';
  const daysDiff = getDaysDiffFromToday(nextDueDate, referenceDateInput);
  if (daysDiff < 0) {
    if (daysDiff < -14) return 'suspended';
    return 'overdue';
  }
  if (daysDiff <= 3) return 'due_soon';
  return 'active';
}

export function cleanMoroccanPhoneNumber(phone?: string | null): string {
  if (!phone || typeof phone !== 'string' || !phone.trim()) return '';
  // Strip all non-digit characters (spaces, dashes, parentheses, dots, slashes, plus)
  let digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // Handle international dial prefixes: '00212' or '212'
  if (digits.startsWith('00212')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('212')) {
    digits = digits.slice(3);
  }

  // Strip domestic leading zeros (e.g. '06...', '07...', '05...', or '+212 06...')
  while (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits ? `212${digits}` : '';
}

export function isValidMoroccanPhone(phone?: string | null): boolean {
  if (!phone || typeof phone !== 'string' || !phone.trim()) return true;
  const cleaned = cleanMoroccanPhoneNumber(phone);
  // Valid Moroccan phone numbers: 212 followed by 5 (landline), 6, or 7 (mobile), and 8 more digits (total 11 digits)
  return /^212[567]\d{8}$/.test(cleaned);
}

export function generateReceiptNumber(payments: PaymentLog[], dateStr: string): string {
  const effectiveDate = dateStr || getTodayDateStr();
  const yearMonth = effectiveDate.replace('-', '').substring(0, 6);
  const monthPayments = payments.filter(
    (p) => (p.paymentDate || '').replace('-', '').substring(0, 6) === yearMonth
  );
  const sequence = String(monthPayments.length + 1).padStart(3, '0');
  return `REC-${yearMonth}-${sequence}`;
}

export function getReceiptNumberOrFallback(payment: PaymentLog): string {
  if (payment.receiptNumber && payment.receiptNumber.trim()) {
    return payment.receiptNumber;
  }
  const dateToUse = payment.paymentDate || getTodayDateStr();
  const yyyymm = dateToUse.replace(/-/g, '').substring(0, 6);
  const idDigits = (payment.id || '').replace(/\D/g, '').slice(-3) || '001';
  return `REC-${yyyymm}-${idDigits.padStart(3, '0')}`;
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

  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

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

  const receiptNumber = getReceiptNumberOrFallback(payment);

  const extraLineFr = hasExtra
    ? `• Frais supplémentaires : *+${payment.extraAmount} MAD* (${payment.extraReason || 'Ajustement'})\n`
    : '';
  const extraLineDar = hasExtra
    ? `• مصاريف إضافية : *+${payment.extraAmount} درهم* (${payment.extraReason || 'مصاريف إضافية'})\n`
    : '';

  const message = `🧾 *Youness WiFi - Reçu de Paiement #${receiptNumber}*

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

export function generateBilanCSV(
  monthStr: string,
  rows: Array<{
    client: Client;
    isPaid: boolean;
    payment?: PaymentLog;
  }>,
  language: 'ar' | 'fr' | 'en' = 'fr'
): string {
  // UTF-8 BOM (\uFEFF) ensures Microsoft Excel on Windows renders Arabic text legibly
  const BOM = '\uFEFF';

  // Semicolon (;) delimiter matches Windows regional Excel expectations
  const headers = language === 'ar'
    ? [
        'معرف المشترك',
        'اسم المشترك',
        'الهاتف',
        'الحي',
        'الباقة',
        'الواجب الشهري (درهم)',
        'حالة الأداء',
        'تاريخ الاستحقاق',
        'تاريخ الأداء',
        'طريقة الدفع',
        'رقم التوصيل',
        'مصاريف إضافية (درهم)',
        'المستخلص',
        'ملاحظات',
      ]
    : [
        'ID Abonné',
        'Nom Abonné',
        'Téléphone',
        'Quartier',
        'Forfait',
        'Montant Mensuel (MAD)',
        'Statut Paiement',
        'Date Échéance',
        'Date Paiement',
        'Mode de Paiement',
        'N° Reçu',
        'Frais Supp (MAD)',
        'Encaissé Par',
        'Notes',
      ];

  const escapeCSVCell = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const lines: string[] = [
    headers.map(escapeCSVCell).join(';'),
  ];

  for (const row of rows) {
    const c = row.client;
    const p = row.payment;
    const isPaid = row.isPaid;
    const fee = c.monthlyFee || 50;

    const statusLabel = isPaid
      ? (language === 'ar' ? 'مؤدى' : 'Réglé')
      : (language === 'ar' ? 'غير مؤدى' : 'Impayé');

    const rowValues = [
      c.id,
      c.name,
      c.phone ? cleanMoroccanPhoneNumber(c.phone) : '',
      c.neighborhood || 'Tétouan',
      c.subscriptionPlan || 'Abonnement Standard',
      fee,
      statusLabel,
      c.nextDueDate || '',
      p?.paymentDate || '',
      p?.method ? p.method.toUpperCase().replace('_', ' ') : '',
      p?.receiptNumber || '',
      p?.extraAmount ? p.extraAmount : 0,
      p?.recordedBy || '',
      p?.notes || c.notes || '',
    ];

    lines.push(rowValues.map(escapeCSVCell).join(';'));
  }

  return BOM + lines.join('\r\n');
}

export function downloadBilanCSV(
  monthStr: string,
  rows: Array<{
    client: Client;
    isPaid: boolean;
    payment?: PaymentLog;
  }>,
  language: 'ar' | 'fr' | 'en' = 'fr'
) {
  if (typeof window === 'undefined') return;
  const csvContent = generateBilanCSV(monthStr, rows, language);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bilan_${monthStr}_YounessWiFi.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
