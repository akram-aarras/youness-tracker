'use client';

import Dialog from '@/components/ui/Dialog';

import React, { useState } from 'react';
import { Client, PaymentLog } from '@/lib/types';
import { useStore, buildHistoricalUnpaidReminderUrl, getTodayDateStr } from '@/lib/store';
import { X, MessageSquare, Copy, Check, CreditCard, Users, Coins } from 'lucide-react';

interface Props {
  monthStr: string;
  monthLabel: string;
  isFutureMonth?: boolean;
  unpaidList: {
    client: Client;
    payment?: PaymentLog;
    isPaid: false;
    isDueInMonth: boolean;
    isOverdueFromPast: boolean;
  }[];
  totalUnpaidAmount: number;
  onClose: () => void;
  onRecordPayment?: (clientId: string) => void;
}

export default function BulkUnpaidReminderModal({
  monthLabel,
  isFutureMonth = false,
  unpaidList,
  totalUnpaidAmount,
  onClose,
  onRecordPayment,
}: Props) {
  const { t, language } = useStore();
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [copiedAll, setCopiedAll] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const handleOpenWhatsApp = (client: Client) => {
    if (!client.phone || !client.phone.trim()) return;
    const { url } = buildHistoricalUnpaidReminderUrl(client, monthLabel, isFutureMonth);
    setSentMap((prev) => ({ ...prev, [client.id]: true }));
    window.open(url, '_blank');
  };

  const handleCopyReport = async () => {
    const isAr = language === 'ar';
    const lines = isAr
      ? [
          `📊 *شبكة يونس للإنترنت - تقرير الاشتراكات غير المؤداة (${monthLabel})*`,
          `📅 تاريخ المعاينة: ${getTodayDateStr()}`,
          `👥 إجمالي المشتركين غير المسددين: ${unpaidList.length}`,
          `💰 المبلغ الإجمالي المستحق: ${totalUnpaidAmount.toLocaleString()} درهم`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          ...unpaidList.map((item, idx) => {
            const c = item.client;
            const fee = c.monthlyFee || 200;
            const phoneLabel = c.phone?.trim() ? `📞 ${c.phone}` : '📞 غير متوفر';
            return `${idx + 1}. *${c.name}* (${c.neighborhood || 'تطوان'}) - ${fee} درهم - ${phoneLabel} - الأجل: ${c.nextDueDate}`;
          }),
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `📍 إدارة شبكة يونس للإنترنت`,
        ]
      : [
          `📊 *Youness WiFi - Rapport des Impayés (${monthLabel})*`,
          `📅 Date d'évaluation : ${getTodayDateStr()}`,
          `👥 Total abonnés non réglés : ${unpaidList.length}`,
          `💰 Montant total à recouvrer : ${totalUnpaidAmount.toLocaleString()} DH`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          ...unpaidList.map((item, idx) => {
            const c = item.client;
            const fee = c.monthlyFee || 200;
            const phoneLabel = c.phone?.trim() ? `📞 ${c.phone}` : '📞 Non renseigné';
            return `${idx + 1}. *${c.name}* (${c.neighborhood || 'Tétouan'}) - ${fee} DH - ${phoneLabel} - Échéance: ${c.nextDueDate}`;
          }),
          `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `📍 Youness WiFi Operations - Tétouan`,
        ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 3000);
    } catch (err) {
      console.error('Failed to copy summary report:', err);
    }
  };

  const filteredItems = unpaidList.filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.client.name.toLowerCase().includes(q) ||
      Boolean(item.client.phone && item.client.phone.includes(q)) ||
      (item.client.neighborhood || '').toLowerCase().includes(q)
    );
  });

  const sentCount = Object.values(sentMap).filter(Boolean).length;

  return (
    <Dialog onClose={onClose} label="Bulk Unpaid Reminder">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl bg-[var(--surface)] border border-[var(--border)]/70 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--border)]/70 bg-[var(--surface-muted)]/95 shrink-0">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-[var(--warning)] border border-amber-500/25 shrink-0">
              <MessageSquare className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text)]">
                  {t('bulk_remind_modal_title')}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-sm font-mono font-bold bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--accent-border)]">
                  {monthLabel}
                </span>
              </div>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                {t('bulk_remind_modal_sub')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition cursor-pointer"
           aria-label={language === "ar" ? "إغلاق" : language === "en" ? "Close" : "Fermer"}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary & Actions Strip */}
        <div className="p-4 sm:p-5 bg-[var(--surface-muted)]/60 border-b border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          {/* Unpaid Count */}
          <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="text-[12px] uppercase font-bold text-[var(--muted)]">
                {language === 'ar' ? 'المشتركون غير المؤدون' : 'Abonnés Non Réglés'}
              </div>
              <div className="text-lg font-black text-[var(--text)] font-mono mt-0.5">
                {unpaidList.length}
              </div>
            </div>
            <Users className="w-5 h-5 text-[var(--error)]" />
          </div>

          {/* Total Uncollected Amount */}
          <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="text-[12px] uppercase font-bold text-[var(--muted)]">
                {language === 'ar' ? 'إجمالي المتأخرات' : 'Total des Impayés'}
              </div>
              <div className="text-lg font-black text-[var(--error)] font-mono mt-0.5">
                {totalUnpaidAmount.toLocaleString()} {t('currency')}
              </div>
            </div>
            <Coins className="w-5 h-5 text-[var(--warning)]" />
          </div>

          {/* Sent Progress */}
          <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="text-[12px] uppercase font-bold text-[var(--muted)]">
                {language === 'ar' ? 'الرسائل المرسلة' : 'Messages Envoyés'}
              </div>
              <div className="text-lg font-black text-[var(--success)] font-mono mt-0.5">
                {sentCount} / {unpaidList.length}
              </div>
            </div>
            <div className="p-1 rounded-lg bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20">
              <Check className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Search & Bulk Copy Toolbar */}
        <div className="px-5 py-3 bg-[var(--surface)] border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <input
            type="text"
            placeholder={language === 'ar' ? 'تصفية بالاسم أو الهاتف...' : 'Filtrer par nom ou téléphone...'}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3 py-1.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition w-full sm:w-64"
           aria-label={language === 'ar' ? 'تصفية بالاسم أو الهاتف...' : 'Filtrer par nom ou téléphone...'}/>

          <button
            type="button"
            onClick={handleCopyReport}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-white border border-[var(--border)] text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
           aria-label="Copier">
            {copiedAll ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? t('bulk_copied_toast') : t('bulk_copy_report_btn')}</span>
          </button>
        </div>

        {/* Subscriber List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-[var(--surface-muted)] rounded-2xl border border-[var(--border)] space-y-2">
              <Check className="w-8 h-8 text-[var(--success)] mx-auto" />
              <p className="text-sm font-semibold text-[var(--text)]">
                {language === 'ar' ? 'لا توجد نتائج مطابقة.' : 'Aucun abonné correspondant.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const client = item.client;
              const fee = client.monthlyFee || 50;
              const isSent = Boolean(sentMap[client.id]);

              return (
                <div
                  key={client.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSent
                      ? 'bg-[var(--surface-muted)]/80 border-emerald-500/30'
                      : 'bg-[var(--surface-muted)] border-[var(--border)] hover:border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center font-bold text-sm text-[var(--text-secondary)] shrink-0">
                      {client.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[var(--text)] truncate">
                          {client.name}
                        </span>
                        <span className="text-[12px] px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--muted)] font-mono border border-[var(--border)]">
                          {client.neighborhood || 'Tétouan'}
                        </span>
                        {isSent && (
                          <span className="text-[12px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-[var(--success)] font-bold border border-emerald-800/60 flex items-center gap-1">
                            <Check className="w-3 h-3 text-[var(--success)]" />
                            {t('bulk_sent_badge')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--muted)] flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{client.phone?.trim() || '—'}</span>
                        <span>•</span>
                        <span className="text-[var(--warning)] font-semibold">{fee} {t('currency')}</span>
                        <span>•</span>
                        <span>{language === 'ar' ? `الأجل: ${client.nextDueDate}` : `Échéance: ${client.nextDueDate}`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {onRecordPayment && (
                      <button
                        type="button"
                        onClick={() => {
                          onRecordPayment(client.id);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title={t('dash_record_payment')}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">{t('dash_record_payment')}</span>
                      </button>
                    )}

                    {client.phone?.trim() ? (
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(client)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          isSent
                            ? 'bg-emerald-600/30 text-[var(--success)] border border-emerald-500/40 hover:bg-emerald-600/40'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{isSent ? (language === 'ar' ? 'إعادة الإرسال' : 'Renvoyer') : t('bulk_open_wa_btn')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-slate-100/50 text-slate-400 border border-slate-200/40 opacity-40 cursor-not-allowed flex items-center gap-1.5 shadow-none"
                        title={language === 'ar' ? 'لا يوجد رقم هاتف' : 'Numéro non renseigné'}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'بدون هاتف' : 'Sans tél'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[var(--surface-muted)] border-t border-[var(--border)]/70 flex items-center justify-between text-sm text-[var(--muted)] shrink-0">
          <span>
            {language === 'ar'
              ? `${unpaidList.length} مشتركين بحاجة إلى تسوية اشتراك ${monthLabel}`
              : `${unpaidList.length} abonnés à relancer pour ${monthLabel}`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text)] font-semibold transition cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
