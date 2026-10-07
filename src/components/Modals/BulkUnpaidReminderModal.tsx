'use client';

import React, { useState } from 'react';
import { Client, PaymentLog } from '@/lib/types';
import { useStore, buildHistoricalUnpaidReminderUrl, cleanMoroccanPhoneNumber, getTodayDateStr } from '@/lib/store';
import {
  X,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Phone,
  AlertTriangle,
  CreditCard,
  Send,
  Users,
  Coins,
  ShieldAlert,
} from 'lucide-react';

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
  monthStr,
  monthLabel,
  isFutureMonth = false,
  unpaidList,
  totalUnpaidAmount,
  onClose,
  onRecordPayment,
}: Props) {
  const { t, language, dir } = useStore();
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [copiedAll, setCopiedAll] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const handleOpenWhatsApp = (client: Client) => {
    const { url } = buildHistoricalUnpaidReminderUrl(client, monthLabel, isFutureMonth);
    setSentMap((prev) => ({ ...prev, [client.id]: true }));
    window.open(url, '_blank');
  };

  const handleCopyReport = async () => {
    const lines = [
      `📊 *Youness WiFi - Rapport des Impayés (${monthLabel})*`,
      `📅 Date d'évaluation : ${getTodayDateStr()}`,
      `👥 Total abonnés non réglés : ${unpaidList.length}`,
      `💰 Montant total à recouvrer : ${totalUnpaidAmount.toLocaleString()} DH`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...unpaidList.map((item, idx) => {
        const c = item.client;
        const fee = c.monthlyFee || 50;
        return `${idx + 1}. *${c.name}* (${c.neighborhood || 'Tétouan'}) - ${fee} DH - 📞 ${c.phone} - Échéance: ${c.nextDueDate}`;
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
      item.client.phone.includes(q) ||
      (item.client.neighborhood || '').toLowerCase().includes(q)
    );
  });

  const sentCount = Object.values(sentMap).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-3xl bg-[#191522] border border-[#2D253B]/70 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#2D253B]/70 bg-[#130F1A]/95 shrink-0">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 shrink-0">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[#F4F0F8]">
                  {t('bulk_remind_modal_title')}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#382647] text-[#F3E8FF] border border-[#523368]">
                  {monthLabel}
                </span>
              </div>
              <p className="text-xs text-[#958B9F] mt-0.5">
                {t('bulk_remind_modal_sub')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary & Actions Strip */}
        <div className="p-4 sm:p-5 bg-[#130F1A]/60 border-b border-[#261E33] grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          {/* Unpaid Count */}
          <div className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#958B9F]">
                {language === 'ar' ? 'المشتركون غير المؤدون' : 'Abonnés Non Réglés'}
              </div>
              <div className="text-lg font-black text-[#F4F0F8] font-mono mt-0.5">
                {unpaidList.length}
              </div>
            </div>
            <Users className="w-5 h-5 text-rose-400" />
          </div>

          {/* Total Uncollected Amount */}
          <div className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#958B9F]">
                {language === 'ar' ? 'إجمالي المتأخرات' : 'Total des Impayés'}
              </div>
              <div className="text-lg font-black text-rose-400 font-mono mt-0.5">
                {totalUnpaidAmount.toLocaleString()} {t('currency')}
              </div>
            </div>
            <Coins className="w-5 h-5 text-amber-400" />
          </div>

          {/* Sent Progress */}
          <div className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#958B9F]">
                {language === 'ar' ? 'الرسائل المرسلة' : 'Messages Envoyés'}
              </div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                {sentCount} / {unpaidList.length}
              </div>
            </div>
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Check className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Search & Bulk Copy Toolbar */}
        <div className="px-5 py-3 bg-[#191522] border-b border-[#261E33] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <input
            type="text"
            placeholder={language === 'ar' ? 'تصفية بالاسم أو الهاتف...' : 'Filtrer par nom ou téléphone...'}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3 py-1.5 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition w-full sm:w-64"
          />

          <button
            type="button"
            onClick={handleCopyReport}
            className="px-3.5 py-1.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] hover:text-white border border-[#3A2F4C] text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? t('bulk_copied_toast') : t('bulk_copy_report_btn')}</span>
          </button>
        </div>

        {/* Subscriber List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-[#130F1A] rounded-2xl border border-[#261E33] space-y-2">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-[#F4F0F8]">
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
                      ? 'bg-[#130F1A]/80 border-emerald-500/30'
                      : 'bg-[#130F1A] border-[#261E33] hover:border-[#3A2F4C]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#191522] border border-[#2D253B] flex items-center justify-center font-bold text-xs text-[#E0D8EB] shrink-0">
                      {client.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#F4F0F8] truncate">
                          {client.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#191522] text-[#958B9F] font-mono border border-[#2D253B]">
                          {client.neighborhood || 'Tétouan'}
                        </span>
                        {isSent && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800/60 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            {t('bulk_sent_badge')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#958B9F] flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{client.phone}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">{fee} {t('currency')}</span>
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
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title={t('dash_record_payment')}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">{t('dash_record_payment')}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(client)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isSent
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isSent ? (language === 'ar' ? 'إعادة الإرسال' : 'Renvoyer') : t('bulk_open_wa_btn')}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#130F1A] border-t border-[#2D253B]/70 flex items-center justify-between text-xs text-[#958B9F] shrink-0">
          <span>
            {language === 'ar'
              ? `${unpaidList.length} مشتركين بحاجة إلى تسوية اشتراك ${monthLabel}`
              : `${unpaidList.length} abonnés à relancer pour ${monthLabel}`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#F4F0F8] font-semibold transition cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
