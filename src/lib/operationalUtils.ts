import type { Client, PaymentLog, SubscriptionStatus } from './types';
import type { Workbook } from 'exceljs';

// Format: YYYY-MM-DD in local Morocco timezone
export function getTodayDateStr(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Casablanca',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

export function addMonthsToDateStr(dateStr: string, monthsToAdd: number = 1, anchorDay?: number): string {
  if (!dateStr || !dateStr.includes('-')) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(anchorDay || today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  const currentDay = parseInt(dayStr, 10);
  const targetDay = anchorDay && anchorDay >= 1 && anchorDay <= 31 ? anchorDay : currentDay;

  // Advance month cleanly
  month += monthsToAdd;
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }

  // Handle month length overflow without date drift
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

export function formatArabicMonthName(input?: string): string {
  if (!input) {
    const now = new Date();
    return `${MOROCCAN_ARABIC_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  }
  const trimmed = input.trim();
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/^(\d{4})-(\d{1,2})/);
  if (match) {
    const year = match[1];
    const monthIdx = parseInt(match[2], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MOROCCAN_ARABIC_MONTHS[monthIdx]} ${year}`;
    }
  }
  return trimmed;
}

// Template A: تذكير بموعد الأداء الشهري (Standard Monthly Due Reminder)
export function buildWhatsAppDueReminderMessage(
  name: string,
  month: string,
  amount: number | string
): string {
  return [
    `السلام عليكم ${name}،`,
    `نذكركم بأن موعد أداء اشتراك الإنترنت لشهر ${month} قد حان.`,
    `💳 الواجب الشهري: ${amount} درهم`,
    `شكراً لوفائكم وثقتكم في خدماتنا.`,
    `— إدارة شبكة يونس و زكرياء للإنترنت`,
  ].join('\n');
}

// Template B: تذكير بالمتأخرات وتفادي الانقطاع (Overdue / Late Payment Notice)
export function buildWhatsAppOverdueNoticeMessage(
  name: string,
  amount: number | string
): string {
  return [
    `السلام عليكم ${name}،`,
    `نود إخباركم بأن اشتراك الإنترنت الخاص بكم متأخر عن موعده المحدد.`,
    `💳 المبلغ المستحق: ${amount} درهم`,
    `المرجو تسوية الواجب في أقرب وقت لضمان استمرار الخدمة وتفادي توقف الصبيب.`,
    `شكراً لتفهمكم.`,
    `— إدارة شبكة يونس و زكرياء للإنترنت`,
  ].join('\n');
}

// Template C: وصل وتأكيد الأداء (Payment Receipt Confirmation)
export function buildWhatsAppReceiptMessage(
  name: string,
  month: string,
  amount: number | string
): string {
  return [
    `السلام عليكم ${name}،`,
    `تم تسجيل أداء اشتراك الإنترنت الخاص بكم لشهر ${month} بنجاح.`,
    `💳 المبلغ المؤدى: ${amount} درهم`,
    `شكراً لالتزامكم.`,
    `— إدارة شبكة يونس و زكرياء للإنترنت`,
  ].join('\n');
}

export function buildWhatsAppReminder(
  client: Client,
  extra?: { amount?: number; reason?: string },
  billingMonth?: string,
  forceTemplate?: 'standard' | 'overdue'
) {
  const daysDiff = getDaysDiffFromToday(client.nextDueDate);
  const cleanPhone = cleanMoroccanPhoneNumber(client.phone);
  const baseFee = client.monthlyFee || 100;
  const extraAmount = Number(extra?.amount) || 0;
  const totalAmount = baseFee + extraAmount;

  const isOverdue = forceTemplate
    ? forceTemplate === 'overdue'
    : daysDiff < 0 || client.status === 'overdue' || client.status === 'suspended';

  let message = '';
  if (isOverdue) {
    // Template B: تذكير بالمتأخرات وتفادي الانقطاع
    message = buildWhatsAppOverdueNoticeMessage(client.name, totalAmount);
  } else {
    // Template A: تذكير بموعد الأداء الشهري
    const month = formatArabicMonthName(billingMonth || client.nextDueDate);
    message = buildWhatsAppDueReminderMessage(client.name, month, totalAmount);
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
  const clientName = payment.clientName || client?.name || '';
  const amount = payment.amount;
  const month = formatArabicMonthName(payment.billingMonth || payment.paymentDate);

  // Template C: وصل وتأكيد الأداء
  const message = buildWhatsAppReceiptMessage(clientName, month, amount);

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
  const fee = client.monthlyFee || 100;
  let message = '';

  if (isFuture) {
    // Template A: تذكير بموعد الأداء الشهري
    const month = formatArabicMonthName(monthLabel);
    message = buildWhatsAppDueReminderMessage(client.name, month, fee);
  } else {
    // Template B: تذكير بالمتأخرات وتفادي الانقطاع
    message = buildWhatsAppOverdueNoticeMessage(client.name, fee);
  }

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
    const fee = c.monthlyFee || 100;

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

/**
 * Formats a Moroccan phone number strictly as a domestic text string (06XXXXXXXX / 07XXXXXXXX)
 * ensuring Excel never parses it as a large number or converts it to scientific notation.
 */
export function formatMoroccanPhoneForExcel(phone?: string | null): string {
  if (!phone || typeof phone !== 'string' || !phone.trim()) return '';
  const cleaned = cleanMoroccanPhoneNumber(phone);
  if (cleaned.startsWith('212') && cleaned.length >= 11) {
    return `0${cleaned.slice(3)}`;
  }
  const rawDigits = phone.replace(/\D/g, '');
  if (rawDigits.startsWith('0') && rawDigits.length === 10) {
    return rawDigits;
  }
  return phone.trim();
}

function localizePlanNameArabic(planName?: string): string {
  if (!planName) return 'اشتراك قياسي';
  const normalized = planName.trim().toLowerCase();
  if (normalized.includes('eco') || normalized.includes('éco') || normalized.includes('50')) {
    return 'باقة اقتصادية (50 درهم)';
  }
  if (normalized.includes('fiber') || normalized.includes('fibre') || normalized.includes('30 mbps')) {
    return '30 ميغابت ألياف هوائية';
  }
  if (normalized.includes('pro') || normalized.includes('150') || normalized.includes('200')) {
    return 'باقة احترافية عالية الصبيب';
  }
  if (normalized.includes('standard') || normalized.includes('100')) {
    return 'اشتراك واي فاي قياسي (100 درهم)';
  }
  return planName
    .replace(/standard/gi, 'قياسي')
    .replace(/pack/gi, 'باقة')
    .replace(/plan/gi, 'اشتراك')
    .replace(/mad/gi, 'درهم')
    .replace(/dh/gi, 'درهم');
}

function localizePaymentMethodArabic(method?: string): string {
  const m = (method || '').toLowerCase().trim();
  switch (m) {
    case 'cash':
      return 'نقداً (كاش)';
    case 'bank_transfer':
      return 'تحويل بنكي';
    case 'check':
      return 'شيك';
    case 'card':
      return 'بطاقة بنكية';
    default:
      return 'نقداً';
  }
}

/**
 * Generates a professionally styled .xlsx Excel workbook with 3 Right-to-Left sheets:
 * 1. "جميع المشتركين" (All Subscribers) with autoFilter on header row
 * 2. "غير مؤدى" (Unpaid Subscribers Only) - Compact 6-column print-optimized layout
 * 3. "مؤدى" (Paid Subscribers Only)
 *
 * If filterTab is 'pending' or 'unpaid', "غير مؤدى" is ordered first and activated so
 * pressing Ctrl+P immediately prints only unpaid subscribers on 2 to 3 A4 pages.
 */
export async function generateBilanExcelWorkbook(
  monthStr: string,
  rows: Array<{
    client: Client;
    isPaid: boolean;
    payment?: PaymentLog;
  }>,
  filterTab?: 'all' | 'paid' | 'unpaid' | 'pending'
): Promise<Workbook> {
  const ExcelJSModule = await import('exceljs');
  const ExcelJS = (ExcelJSModule.default || ExcelJSModule) as typeof import('exceljs');
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'شبكة يونس وزكرياء للإنترنت (Tétouan)';
  workbook.lastModifiedBy = 'Youness WiFi Tracker';
  workbook.created = new Date();
  workbook.modified = new Date();

  const isUnpaidFilter = filterTab === 'unpaid' || filterTab === 'pending';
  const isPaidFilter = filterTab === 'paid';

  let sheetOrder: Array<'unpaid' | 'all' | 'paid'>;
  if (isUnpaidFilter) {
    sheetOrder = ['unpaid', 'all', 'paid'];
  } else if (isPaidFilter) {
    sheetOrder = ['paid', 'all', 'unpaid'];
  } else {
    sheetOrder = ['all', 'unpaid', 'paid'];
  }

  // Set workbook view so the first tab (index 0) is active
  workbook.views = [
    {
      x: 0,
      y: 0,
      width: 10000,
      height: 20000,
      firstSheet: 0,
      activeTab: 0,
      visibility: 'visible',
    },
  ];

  const a4PageSetup = {
    paperSize: 9, // A4
    orientation: 'portrait' as const,
    fitToPage: true,
    fitToWidth: 1, // forces all columns onto 1 page wide
    fitToHeight: 0, // automatic vertical flow
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.35,
      bottom: 0.35,
      header: 0.2,
      footer: 0.2,
    },
    printTitlesRow: '1:2', // repeats the header on each printed page
  };

  for (let sIdx = 0; sIdx < sheetOrder.length; sIdx++) {
    const sheetType = sheetOrder[sIdx];
    const isFirstTab = sIdx === 0;
    const views = [{ rightToLeft: true, ...(isFirstTab ? { activeTab: 0 } : {}) }];

    if (sheetType === 'unpaid') {
      // -------------------------------------------------------------
      // Compact 6-Column Print-Optimized Layout for "غير مؤدى"
      // -------------------------------------------------------------
      const sheet = workbook.addWorksheet('غير مؤدى', { views });
      sheet.pageSetup = a4PageSetup;

      const unpaidRows = rows.filter((r) => !r.isPaid);

      // 1. Top Title Banner (Row 1)
      sheet.mergeCells('A1:F1');
      const bannerRow = sheet.getRow(1);
      bannerRow.height = 34;
      const bannerCell = sheet.getCell('A1');
      bannerCell.value = `شبكة يونس وزكرياء للإنترنت — لائحة المشتركين غير المؤدين (قيد التحصيل): ${monthStr}`;
      bannerCell.font = {
        name: 'Segoe UI',
        size: 13,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      bannerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF064E3B' },
      };
      bannerCell.alignment = { vertical: 'middle', horizontal: 'center' };
      bannerCell.border = {
        top: { style: 'thin', color: { argb: 'FF047857' } },
        bottom: { style: 'medium', color: { argb: 'FF047857' } },
        left: { style: 'thin', color: { argb: 'FF047857' } },
        right: { style: 'thin', color: { argb: 'FF047857' } },
      };

      // 2. Emerald Header Row (Row 2) - 6 Concise Columns
      const compactHeaders = [
        '#',
        'اسم المشترك',
        'الهاتف',
        'الحي',
        'الواجب الشهري',
        'تأشير الأداء / ملاحظات',
      ];
      const headerRow = sheet.getRow(2);
      headerRow.height = 26;
      headerRow.values = [...compactHeaders];
      headerRow.eachCell((cell) => {
        cell.font = {
          name: 'Segoe UI',
          size: 10.5,
          bold: true,
          color: { argb: 'FFFFFFFF' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF059669' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF047857' } },
          bottom: { style: 'medium', color: { argb: 'FF047857' } },
          left: { style: 'thin', color: { argb: 'FF047857' } },
          right: { style: 'thin', color: { argb: 'FF047857' } },
        };
      });

      sheet.autoFilter = 'A2:F2';

      // 3. Compact Data Rows (18 pt row height, 10 pt font)
      let currentRowNum = 3;
      unpaidRows.forEach((r, idx) => {
        const c = r.client;
        const fee = c.monthlyFee || 100;
        const phoneText = formatMoroccanPhoneForExcel(c.phone);
        const notesMarking = c.notes ? `[  ] ${c.notes}` : '[  ]';

        const dataRow = sheet.getRow(currentRowNum);
        dataRow.height = 18;

        dataRow.values = [
          idx + 1,
          c.name,
          phoneText,
          c.neighborhood || 'تطوان',
          fee,
          notesMarking,
        ];

        // Format Phone (Col C) strictly as text
        const phoneCell = dataRow.getCell(3);
        phoneCell.value = phoneText;
        phoneCell.numFmt = '@';
        phoneCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Number format for fee
        const feeCell = dataRow.getCell(5);
        feeCell.numFmt = '#,##0 "درهم"';
        feeCell.alignment = { vertical: 'middle', horizontal: 'center' };

        const isOddRow = currentRowNum % 2 === 1;
        for (let col = 1; col <= 6; col++) {
          const cell = dataRow.getCell(col);
          cell.font = {
            name: 'Segoe UI',
            size: 10,
            color: { argb: 'FF1F2937' },
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          };

          if (isOddRow) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF9FAFB' },
            };
          } else {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' },
            };
          }

          if (col === 2 || col === 6) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        }

        currentRowNum++;
      });

      // 4. Compact Summary Row
      const totalUnpaidDH = unpaidRows.reduce(
        (sum, x) => sum + (x.client.monthlyFee || 100),
        0
      );
      const summaryRow = sheet.getRow(currentRowNum);
      summaryRow.height = 26;
      summaryRow.values = [
        'المجموع',
        `إجمالي غير المؤدين: ${unpaidRows.length}`,
        '',
        '',
        `مجموع الواجب: ${totalUnpaidDH.toLocaleString()} درهم`,
        `غير مؤدى: ${totalUnpaidDH.toLocaleString()} درهم`,
      ];

      for (let col = 1; col <= 6; col++) {
        const cell = summaryRow.getCell(col);
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF059669' } },
          bottom: { style: 'double', color: { argb: 'FF059669' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };

        if (col === 5 || col === 6) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' },
          };
          cell.font = {
            name: 'Segoe UI',
            size: 10.5,
            bold: true,
            color: { argb: 'FF991B1B' },
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' },
          };
          cell.font = {
            name: 'Segoe UI',
            size: 10.5,
            bold: true,
            color: { argb: 'FF111827' },
          };
        }
      }

      // 5. Widths for compact 6 columns
      const compactColWidths: Record<number, number> = {
        1: 6, // #
        2: 28, // اسم المشترك
        3: 15, // الهاتف
        4: 16, // الحي
        5: 16, // الواجب الشهري
        6: 24, // تأشير الأداء / ملاحظات
      };

      sheet.columns.forEach((column, colIdx) => {
        const colNumber = colIdx + 1;
        let maxLen = 0;
        column.eachCell?.({ includeEmpty: false }, (cell, rowNum) => {
          if (rowNum === 1) return;
          const val = cell.value != null ? String(cell.value) : '';
          if (val.length > maxLen) maxLen = val.length;
        });
        const defaultWidth = compactColWidths[colNumber] || 15;
        column.width = Math.max(maxLen + 2, defaultWidth);
      });
    } else {
      // -------------------------------------------------------------
      // Full 14-Column Layout for "جميع المشتركين" and "مؤدى"
      // -------------------------------------------------------------
      const isAll = sheetType === 'all';
      const sheetName = isAll ? 'جميع المشتركين' : 'مؤدى';
      const sheetTitle = isAll
        ? `شبكة يونس وزكرياء للإنترنت — كشف الحسابات الشهري: ${monthStr} (جميع المشتركين)`
        : `شبكة يونس وزكرياء للإنترنت — لائحة المشتركين المؤدين (الاستخلاصات): ${monthStr} (مؤدى)`;
      const sheetData = isAll ? rows : rows.filter((r) => r.isPaid);

      const sheet = workbook.addWorksheet(sheetName, { views });
      sheet.pageSetup = a4PageSetup;

      // 1. Top Title Banner (Row 1)
      sheet.mergeCells('A1:N1');
      const bannerRow = sheet.getRow(1);
      bannerRow.height = 42;
      const bannerCell = sheet.getCell('A1');
      bannerCell.value = sheetTitle;
      bannerCell.font = {
        name: 'Segoe UI',
        size: 14,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      bannerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF064E3B' },
      };
      bannerCell.alignment = { vertical: 'middle', horizontal: 'center' };
      bannerCell.border = {
        top: { style: 'thin', color: { argb: 'FF047857' } },
        bottom: { style: 'medium', color: { argb: 'FF047857' } },
        left: { style: 'thin', color: { argb: 'FF047857' } },
        right: { style: 'thin', color: { argb: 'FF047857' } },
      };

      // 2. Emerald Header Row (Row 2) - 14 Columns
      const headers = [
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
      ];
      const headerRow = sheet.getRow(2);
      headerRow.height = 30;
      headerRow.values = [...headers];
      headerRow.eachCell((cell) => {
        cell.font = {
          name: 'Segoe UI',
          size: 11,
          bold: true,
          color: { argb: 'FFFFFFFF' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF059669' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF047857' } },
          bottom: { style: 'medium', color: { argb: 'FF047857' } },
          left: { style: 'thin', color: { argb: 'FF047857' } },
          right: { style: 'thin', color: { argb: 'FF047857' } },
        };
      });

      sheet.autoFilter = 'A2:N2';

      // 3. Data Rows
      let currentRowNum = 3;
      for (const r of sheetData) {
        const c = r.client;
        const p = r.payment;
        const isPaid = r.isPaid;
        const fee = c.monthlyFee || 100;
        const statusText = isPaid ? 'مؤدى' : 'غير مؤدى';
        const phoneText = formatMoroccanPhoneForExcel(c.phone);
        const planText =
          localizePlanNameArabic(c.subscriptionPlan) ||
          c.subscriptionPlan ||
          'اشتراك قياسي';
        const methodText = p?.method
          ? localizePaymentMethodArabic(p.method)
          : '-';

        const dataRow = sheet.getRow(currentRowNum);
        dataRow.height = 24;

        dataRow.values = [
          c.id,
          c.name,
          phoneText,
          c.neighborhood || 'تطوان',
          planText,
          fee,
          statusText,
          c.nextDueDate || '-',
          p?.paymentDate || '-',
          methodText,
          p?.receiptNumber || '-',
          p?.extraAmount ? p.extraAmount : 0,
          p?.recordedBy || '-',
          p?.notes || c.notes || '-',
        ];

        // Format Phone (Column C) strictly as Text string
        const phoneCell = dataRow.getCell(3);
        phoneCell.value = phoneText;
        phoneCell.numFmt = '@';
        phoneCell.alignment = { vertical: 'middle', horizontal: 'center' };

        const feeCell = dataRow.getCell(6);
        feeCell.numFmt = '#,##0 "درهم"';

        const extraCell = dataRow.getCell(12);
        extraCell.numFmt = '#,##0 "درهم"';

        const statusCell = dataRow.getCell(7);
        if (isPaid) {
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD1FAE5' },
          };
          statusCell.font = {
            name: 'Segoe UI',
            size: 11,
            bold: true,
            color: { argb: 'FF065F46' },
          };
        } else {
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' },
          };
          statusCell.font = {
            name: 'Segoe UI',
            size: 11,
            bold: true,
            color: { argb: 'FF991B1B' },
          };
        }
        statusCell.alignment = { vertical: 'middle', horizontal: 'center' };

        const isOddRow = currentRowNum % 2 === 1;
        for (let col = 1; col <= 14; col++) {
          const cell = dataRow.getCell(col);
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          };

          if (col !== 7) {
            cell.font = {
              name: 'Segoe UI',
              size: 10.5,
              color: { argb: 'FF1F2937' },
            };
            if (isOddRow) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF9FAFB' },
              };
            } else {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFFFF' },
              };
            }

            if (col === 2 || col === 14) {
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
          }
        }

        currentRowNum++;
      }

      // 4. Total Summary Row
      const totalSubscribers = sheetData.length;
      const totalPaidDH = sheetData
        .filter((x) => x.isPaid)
        .reduce(
          (sum, x) => sum + (x.payment?.amount ?? (x.client.monthlyFee || 100)),
          0
        );
      const totalUnpaidDH = sheetData
        .filter((x) => !x.isPaid)
        .reduce((sum, x) => sum + (x.client.monthlyFee || 100), 0);
      const totalDueDH = totalPaidDH + totalUnpaidDH;

      const summaryRow = sheet.getRow(currentRowNum);
      summaryRow.height = 32;

      summaryRow.values = [
        'المجموع العام',
        `إجمالي المشتركين: ${totalSubscribers}`,
        '',
        '',
        '',
        `مجموع الواجب: ${totalDueDH.toLocaleString()} درهم`,
        `المؤدى: ${totalPaidDH.toLocaleString()} درهم`,
        `غير المؤدى: ${totalUnpaidDH.toLocaleString()} درهم`,
        '',
        '',
        '',
        '',
        '',
        '',
      ];

      for (let col = 1; col <= 14; col++) {
        const cell = summaryRow.getCell(col);
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF059669' } },
          bottom: { style: 'double', color: { argb: 'FF059669' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };

        if (col === 7) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD1FAE5' },
          };
          cell.font = {
            name: 'Segoe UI',
            size: 11,
            bold: true,
            color: { argb: 'FF065F46' },
          };
        } else if (col === 8) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' },
          };
          cell.font = {
            name: 'Segoe UI',
            size: 11,
            bold: true,
            color: { argb: 'FF991B1B' },
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' },
          };
          cell.font = {
            name: 'Segoe UI',
            size: 11,
            bold: true,
            color: { argb: 'FF111827' },
          };
        }
      }

      const minColWidths: Record<number, number> = {
        1: 16,
        2: 26,
        3: 18,
        4: 18,
        5: 24,
        6: 22,
        7: 20,
        8: 20,
        9: 18,
        10: 18,
        11: 20,
        12: 22,
        13: 20,
        14: 28,
      };

      sheet.columns.forEach((column, colIdx) => {
        const colNumber = colIdx + 1;
        let maxLen = 0;
        column.eachCell?.({ includeEmpty: false }, (cell, rowNum) => {
          if (rowNum === 1) return;
          const val = cell.value != null ? String(cell.value) : '';
          if (val.length > maxLen) {
            maxLen = val.length;
          }
        });
        const defaultMin = minColWidths[colNumber] || 16;
        column.width = Math.min(Math.max(maxLen + 4, defaultMin), 45);
      });
    }
  }

  return workbook;
}

/**
 * Downloads a professionally styled Excel spreadsheet (.xlsx) for Youness WiFi.
 */
export async function downloadBilanExcel(
  monthStr: string,
  rows: Array<{
    client: Client;
    isPaid: boolean;
    payment?: PaymentLog;
  }>,
  filterTab?: 'all' | 'paid' | 'unpaid' | 'pending'
): Promise<void> {
  if (typeof window === 'undefined') return;
  const workbook = await generateBilanExcelWorkbook(monthStr, rows, filterTab);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bilan_${monthStr}_YounessWiFi.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadBilanCSV(
  monthStr: string,
  rows: Array<{
    client: Client;
    isPaid: boolean;
    payment?: PaymentLog;
  }>,
  filterTabOrLang?: 'all' | 'paid' | 'unpaid' | 'pending' | 'ar' | 'fr' | 'en'
): Promise<void> {
  const filterTab =
    filterTabOrLang === 'paid' || filterTabOrLang === 'unpaid' || filterTabOrLang === 'pending'
      ? filterTabOrLang
      : 'all';
  return downloadBilanExcel(monthStr, rows, filterTab);
}

/**
 * Collision-proof client ID generator.
 * Scans all existing client IDs (e.g. 'cli-001' ... 'cli-392'), determines the highest
 * numeric suffix, and yields the next sequential ID (e.g. 'cli-393').
 * Also performs an existence check against all existing IDs to ensure 100% collision immunity.
 */
export function generateNextClientId(existingClients: Array<{ id: string }>): string {
  let maxIdNum = 0;
  const existingIdSet = new Set<string>();

  for (const client of existingClients) {
    if (!client || !client.id) continue;
    const rawId = String(client.id).trim();
    existingIdSet.add(rawId);

    const match = rawId.match(/^cli-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxIdNum) {
        maxIdNum = num;
      }
    }
  }

  let candidateNum = Math.max(maxIdNum, existingClients.length) + 1;
  let candidateId = `cli-${String(candidateNum).padStart(3, '0')}`;

  while (existingIdSet.has(candidateId)) {
    candidateNum++;
    candidateId = `cli-${String(candidateNum).padStart(3, '0')}`;
  }

  return candidateId;
}

/**
 * Reverts client due date, last payment date, and status safely when undoing a payment.
 * Reverts next_due_date to previousDueDate if available and valid, or steps back 1 billing month.
 * Restores lastPaymentDate to the most recent remaining payment or installationDate.
 */
export function calculateUndoPaymentReversal(
  client: Client,
  paymentToUndo: PaymentLog,
  remainingPayments: PaymentLog[] = [],
  referenceDateInput?: string | Date
): {
  revertedNextDueDate: string;
  revertedLastPaymentDate: string | undefined;
  revertedStatus: SubscriptionStatus;
} {
  // 1. Determine reverted next_due_date:
  let revertedNextDueDate: string;
  if (
    paymentToUndo.previousDueDate &&
    paymentToUndo.previousDueDate.includes('-') &&
    paymentToUndo.previousDueDate !== paymentToUndo.newDueDate
  ) {
    revertedNextDueDate = paymentToUndo.previousDueDate;
  } else {
    revertedNextDueDate = addMonthsToDateStr(client.nextDueDate, -1);
  }

  // 2. Determine reverted last_payment_date:
  let revertedLastPaymentDate: string | undefined;
  if (remainingPayments && remainingPayments.length > 0) {
    const sortedRemaining = [...remainingPayments].sort(
      (a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || '') || b.id.localeCompare(a.id)
    );
    revertedLastPaymentDate = sortedRemaining[0].paymentDate;
  } else {
    revertedLastPaymentDate = client.installationDate || undefined;
  }

  // 3. Recompute client status:
  const revertedStatus = calculateClientStatus(
    revertedNextDueDate,
    client.status === 'archived' ? 'archived' : undefined,
    referenceDateInput
  );

  return {
    revertedNextDueDate,
    revertedLastPaymentDate,
    revertedStatus,
  };
}

