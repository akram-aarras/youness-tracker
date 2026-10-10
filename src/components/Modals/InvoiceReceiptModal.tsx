'use client';

import Dialog from '@/components/ui/Dialog';

import React from 'react';
import { Client, PaymentLog } from '@/lib/types';
import { useStore, getReceiptNumberOrFallback } from '@/lib/store';
import { X, Printer, Share2, CheckCircle, Phone, MapPin } from 'lucide-react';

interface Props {
  payment: PaymentLog;
  client?: Client;
  onClose: () => void;
}

export default function InvoiceReceiptModal({ payment, client, onClose }: Props) {
  const { clients, getWhatsAppReceiptUrl, language, t, localizePlanName, localizePaymentMethod } = useStore();

  // Resolve client from store if not provided directly
  const resolvedClient = client || clients.find((c) => c.id === payment.clientId);

  // Dynamic receipt number with reliable fallback
  const receiptNumber = payment.receiptNumber?.trim() || getReceiptNumberOrFallback(payment);

  const baseFee = payment.baseFee ?? (payment.amount - (payment.extraAmount ?? 0));
  const extraAmount = payment.extraAmount ?? 0;
  const extraReason = payment.extraReason || (language === 'ar' ? 'مصاريف إضافية' : 'Frais supplémentaires / Ad-hoc');
  const hasExtra = extraAmount > 0;
  const totalAmount = payment.amount;

  const { url: whatsappUrl } = getWhatsAppReceiptUrl(payment, resolvedClient);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const clientPhone = resolvedClient?.phone || 'N/A';
  const clientNeighborhood = resolvedClient?.neighborhood || 'Tétouan';
  const pppoeUsername = resolvedClient?.hardware?.pppoeUsername || 'N/A';
  const planName = resolvedClient?.subscriptionPlan
    ? localizePlanName(resolvedClient.subscriptionPlan, language)
    : (language === 'ar' ? 'اشتراك إنترنت قياسي' : 'Abonnement Standard Internet');

  const periodLabel = payment.previousDueDate && payment.newDueDate
    ? `${payment.previousDueDate} → ${payment.newDueDate}`
    : (language === 'ar' ? `إلى غاية ${payment.newDueDate}` : `Jusqu'au ${payment.newDueDate}`);
  const billingMonth = payment.billingMonth || payment.paymentDate?.substring(0, 7) || payment.paymentDate;

  return (
    <Dialog onClose={onClose} label="Invoice Receipt">
      {/* Strict 1-Page Media Print Isolation CSS */}
      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          html, body { margin:0 !important; padding:0 !important; min-height:0 !important; height:auto !important; background:white !important; }
          body *:not(:has(#receipt-print-section)):not(#receipt-print-section):not(#receipt-print-section *) { display:none !important; }
          body *:has(#receipt-print-section) { display:block !important; position:static !important; min-height:0 !important; height:auto !important; max-height:none !important; width:100% !important; max-width:none !important; margin:0 !important; padding:0 !important; border:0 !important; background:white !important; box-shadow:none !important; overflow:visible !important; }
          dialog::backdrop { display:none !important; backdrop-filter:none !important; }
          #receipt-print-section { position:static !important; width:100% !important; margin:0 !important; padding:0 !important; background:white !important; color:#192336 !important; break-inside:avoid !important; }
          #receipt-print-section [class~="print:hidden"] { display:none !important; }
        }
      `}</style>

      {/* Modal Backdrop Overlay (Screen only) */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card container: strictly centered on all screen sizes, transparent & static in print */}
      <div className="relative w-full max-w-md my-auto bg-white text-slate-900 rounded-2xl shadow-2xl p-5 sm:p-6 border border-slate-200 flex flex-col space-y-4 print:p-0 print:m-0 print:border-none print:shadow-none print:bg-transparent print:static">
        {/* Close Button (Screen only) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition print:hidden cursor-pointer"
          aria-label={t('close')}
        >
          <X className="w-4 h-4" />
        </button>

        {/* SINGLE RECEIPT PRINT SECTION (No duplicates in DOM) */}
        <div id="receipt-print-section" className="space-y-3.5 print:bg-white print:text-slate-900">
          {/* 1. Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  YOUNESS<span className="text-amber-500">WIFI</span>
                </span>
                <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                  {language === 'ar' ? 'موزع تطوان WISP' : 'WISP TÉTOUAN'}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 mt-1">
                {language === 'ar' ? 'الولاية / بوجراح، تطوان' : 'Wilaya / Boujarah, Tétouan'}
              </p>
              <p className="text-[12px] text-slate-500 font-mono">
                {language === 'ar' ? 'مكتب الدعم: +212 661-000111' : 'Support : +212 661-000111'}
              </p>
            </div>

            <div className="text-right rtl:text-left pr-6 sm:pr-0 rtl:pr-0 rtl:pl-6 sm:rtl:pl-0 print:pr-0 print:rtl:pl-0">
              <div
                id="receipt-modal-title"
                className="text-[12px] uppercase font-bold text-slate-400 tracking-wider"
              >
                {language === 'ar' ? 'وصل أداء رقم' : 'Reçu de Paiement N°'}
              </div>
              <div className="font-mono font-bold text-sm sm:text-sm text-slate-900 mt-0.5">
                {receiptNumber}
              </div>
              <div className="text-[12px] text-slate-500 font-mono mt-0.5">
                {payment.paymentDate}
              </div>
            </div>
          </div>

          {/* 2. Subscriber Box (Compact 2-column grid) */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
            <div>
              <span className="text-[12px] uppercase font-bold text-slate-400 block mb-0.5">
                {language === 'ar' ? 'المشترك' : 'Abonné / Client'}
              </span>
              <div className="font-bold text-slate-900 truncate">{payment.clientName}</div>
              <div className="text-[12px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{clientPhone}</span>
              </div>
            </div>

            <div>
              <span className="text-[12px] uppercase font-bold text-slate-400 block mb-0.5">
                {language === 'ar' ? 'المنطقة والمعرف' : 'Zone & Identifiant'}
              </span>
              <div className="text-slate-800 font-medium truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="truncate">{clientNeighborhood}</span>
              </div>
              <div className="mt-0.5">
                <span className="font-mono text-[12px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold inline-block truncate max-w-full">
                  PPPoE : {pppoeUsername}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Payment & Validity Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                {language === 'ar' ? 'الاشتراك / الباقة:' : 'Forfait / Plan :'}
              </span>
              <span className="font-semibold text-slate-900 text-right rtl:text-left truncate max-w-[210px]">
                {planName}
              </span>
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-500">
                {language === 'ar' ? 'الفترة المغطاة:' : 'Période couverte :'}
              </span>
              <span className="font-mono font-medium text-slate-700">
                {periodLabel}
              </span>
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-500">
                {language === 'ar' ? 'الشهر / الطريقة:' : 'Mois / Mode :'}
              </span>
              <span className="text-slate-700 font-medium">
                {billingMonth} • <span className="font-semibold">{localizePaymentMethod(payment.method, language)}</span>
              </span>
            </div>

            {hasExtra && (
              <div className="border-t border-slate-200 pt-1.5 space-y-1 text-[12px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span>{language === 'ar' ? 'الواجب الأساسي:' : 'Abonnement de base :'}</span>
                  <span className="font-mono">{Number(baseFee).toFixed(2)} DH</span>
                </div>
                <div className="flex items-center justify-between text-amber-700">
                  <span>{language === 'ar' ? `مصاريف إضافية (${extraReason}):` : `Frais supplémentaires (${extraReason}) :`}</span>
                  <span className="font-mono font-semibold">+{Number(extraAmount).toFixed(2)} DH</span>
                </div>
              </div>
            )}

            {/* Total Amount Paid & Status */}
            <div className="border-t border-slate-200 pt-2.5 flex items-end justify-between">
              <div>
                <div className="text-[12px] uppercase font-bold tracking-wider text-slate-400">
                  {language === 'ar' ? 'المجموع المؤدى' : 'Total Montant Réglé'}
                </div>
                <div className="text-2xl font-black font-mono text-emerald-600 tracking-tight leading-none mt-1">
                  {Number(totalAmount).toFixed(2)} DH
                </div>
              </div>

              <div className="text-right rtl:text-left space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle className="w-3 h-3" />
                  {language === 'ar' ? 'خالص / مسوّى (0 درهم متبقي)' : 'Payé / Soldé (0 DH restant)'}
                </span>
                <div className="text-[12px] text-slate-500 font-mono">
                  {language === 'ar' ? 'الأجل القادم: ' : 'Prochaine échéance : '}
                  <strong className="text-slate-800 font-bold">{payment.newDueDate}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          {payment.notes && (
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[12px] text-slate-600 italic break-words overflow-hidden">
              <span className="font-semibold text-slate-700 not-italic">
                {language === 'ar' ? 'ملاحظة: ' : 'Note : '}
              </span>
              <span className="break-all">{payment.notes}</span>
            </div>
          )}

          {/* 4. Footer */}
          <div className="border-t border-slate-200 pt-2.5 flex items-center justify-between text-[12px] text-slate-500">
            <span>
              {language === 'ar' ? 'شكراً لوفائكم — اتصال نشط' : 'Merci pour votre fidélité — Connexion active'}
            </span>
            <span className="font-mono font-semibold text-slate-700">
              {language === 'ar' ? 'استخلص من طرف: ' : 'Encaissé par : '}
              {payment.recordedBy || 'Youness (NOC Admin)'}
            </span>
          </div>
        </div>

        {/* 5. Action Buttons (Screen only) */}
        <div className="grid grid-cols-3 gap-2 pt-1 print:hidden">
          {/* 🖨️ Imprimer / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--warning)]" />
            <span>{language === 'ar' ? 'طباعة / PDF' : 'Imprimer / PDF'}</span>
          </button>

          {/* 💬 Partager WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[40px] px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>واتساب</span>
          </a>

          {/* ✕ Fermer */}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold flex items-center justify-center transition cursor-pointer border border-slate-200"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
