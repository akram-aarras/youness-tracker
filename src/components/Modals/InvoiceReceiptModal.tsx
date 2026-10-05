'use client';

import React, { useState } from 'react';
import { Client, PaymentLog } from '@/lib/types';
import { useStore } from '@/lib/store';
import {
  X,
  Printer,
  Share2,
  CheckCircle,
  Copy,
  Check,
  Receipt,
  Building2,
  Calendar,
  CreditCard,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface Props {
  payment: PaymentLog;
  client?: Client;
  onClose: () => void;
}

export default function InvoiceReceiptModal({ payment, client, onClose }: Props) {
  const { getWhatsAppReceiptUrl } = useStore();
  const [copied, setCopied] = useState(false);

  const baseFee = payment.baseFee ?? (payment.amount - (payment.extraAmount ?? 0));
  const extraAmount = payment.extraAmount ?? 0;
  const extraReason = payment.extraReason || 'Frais supplémentaires / Ad-hoc fee';
  const hasExtra = extraAmount > 0;
  const totalAmount = payment.amount;

  const { url: whatsappUrl, text: receiptText, cleanPhone } = getWhatsAppReceiptUrl(
    payment,
    client
  );

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      {/* Print-specific style injected */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt,
          #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            border: 2px solid #000 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 24px !important;
          }
          #printable-receipt .no-print {
            display: none !important;
          }
          #printable-receipt .print-black {
            color: #000 !important;
          }
          #printable-receipt .print-border {
            border-color: #333 !important;
          }
          #printable-receipt .print-bg-light {
            background-color: #f4f4f5 !important;
          }
        }
      `}</style>

      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl bg-[#191522] sm:border sm:border-[#2D253B]/70 rounded-none sm:rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col my-0 sm:my-6">
        {/* Header (Non-printable) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#2D253B]/70 bg-[#130F1A]/95 no-print shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F4F0F8] flex items-center gap-2">
                <span>Official Payment Slip & Invoice</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-bold">
                  PAID / RÉGLÉ
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-[#958B9F]">
                Itemized subscription breakdown & fiscal proof
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

        {/* Printable Receipt Card Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 overflow-x-hidden flex-1" id="printable-receipt">
          {/* Brand Header */}
          <div className="border-b border-[#261E33] print-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white print-black">
                  YOUNESS<span className="text-amber-500">WIFI</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 print-border print-black">
                  WISP TÉTOUAN
                </span>
              </div>
              <p className="text-xs text-slate-400 print-black mt-0.5">
                Réseau Internet Haut Débit Sans-Fil • Wilaya / Boujarah
              </p>
              <p className="text-[11px] text-slate-500 print-black font-mono">
                Support: +212 661-000111 • contact@younesswifi.ma
              </p>
            </div>

            <div className="sm:text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 print-black">
                Reçu de Paiement N°
              </div>
              <div className="font-mono font-bold text-base text-amber-400 print-black">
                {payment.receiptNumber}
              </div>
              <div className="text-xs text-slate-400 print-black mt-0.5">
                Date: <span className="font-mono text-white print-black">{payment.paymentDate}</span>
              </div>
            </div>
          </div>

          {/* Subscriber & Service Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] print-bg-light print-border">
              <div className="text-[10px] uppercase font-bold text-[#958B9F] print-black mb-1">
                Client / Subscriber
              </div>
              <div className="font-bold text-sm text-[#F4F0F8] print-black">
                {payment.clientName}
              </div>
              {client?.phone && (
                <div className="text-[#958B9F] print-black flex items-center gap-1.5 mt-1 font-mono">
                  <Phone className="w-3 h-3 text-emerald-400 print-black" />
                  {client.phone}
                </div>
              )}
              {client?.neighborhood && (
                <div className="text-[#958B9F] print-black flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-amber-400 print-black" />
                  {client.neighborhood} {client.address ? `• ${client.address}` : ''}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] print-bg-light print-border">
              <div className="text-[10px] uppercase font-bold text-[#958B9F] print-black mb-1">
                Subscription & Validity
              </div>
              <div className="text-[#E0D8EB] print-black">
                Plan: <strong className="text-[#F4F0F8] print-black">{client?.subscriptionPlan || 'Abonnement Wi-Fi'}</strong>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="text-[#958B9F] print-black">Période:</span>
                <span className="font-mono text-amber-400 print-black">{payment.previousDueDate}</span>
                <ArrowRight className="w-3 h-3 text-[#958B9F]/60 print-black" />
                <span className="font-mono font-bold text-emerald-400 print-black">{payment.newDueDate}</span>
              </div>
              <div className="text-[11px] text-[#958B9F] print-black mt-1">
                Mode: <span className="uppercase font-semibold text-[#E0D8EB] print-black">{payment.method.replace('_', ' ')}</span>
                {payment.recordedBy ? ` • Opérateur: ${payment.recordedBy}` : ''}
              </div>
              {payment.billingMonth && (
                <div className="text-[11px] text-[#958B9F] print-black mt-0.5 font-mono">
                  Mois de facturation: <strong className="text-amber-400 print-black">{payment.billingMonth}</strong>
                </div>
              )}
            </div>
          </div>

          {/* ITEMIZED CALCULATION BREAKDOWN */}
          <div className="rounded-xl border border-[#261E33] print-border overflow-hidden">
            <div className="px-4 py-2.5 bg-[#130F1A] print-bg-light border-b border-[#261E33] print-border flex items-center justify-between text-xs font-bold text-[#E0D8EB] print-black uppercase tracking-wider">
              <span>Description / Rubrique</span>
              <span className="text-right">Montant (MAD)</span>
            </div>

            <div className="divide-y divide-[#261E33] print-border bg-[#130F1A]/50">
              {/* Row 1: Base Subscription */}
              <div className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-bold text-[#F4F0F8] print-black">
                    Abonnement Mensuel Internet
                  </div>
                  <div className="text-xs text-[#958B9F] print-black">
                    Tarif de base mensuel pour la période échue
                  </div>
                </div>
                <div className="font-mono font-bold text-[#F4F0F8] print-black">
                  {baseFee} <span className="text-xs text-[#958B9F] print-black">MAD</span>
                </div>
              </div>

              {/* Row 2: Extra Charges (if any) */}
              {hasExtra && (
                <div className="px-4 py-3 flex items-center justify-between text-sm bg-amber-500/10 print-bg-light">
                  <div>
                    <div className="font-bold text-amber-300 print-black flex items-center gap-1.5">
                      <span>Frais Supplémentaires</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 print-black">
                        Ad-hoc
                      </span>
                    </div>
                    <div className="text-xs text-amber-200/80 print-black italic">
                      Motif: {extraReason}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-amber-400 print-black">
                    +{extraAmount} <span className="text-xs text-amber-300 print-black">MAD</span>
                  </div>
                </div>
              )}

              {/* Total Row */}
              <div className="px-4 py-3.5 bg-[#130F1A] print-bg-light flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-[#958B9F] print-black">
                    TOTAL PAYÉ / TOTAL AMOUNT DUE
                  </div>
                  <div className="text-[11px] text-emerald-400 print-black flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Règlement effectué avec succès
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-xl text-emerald-400 print-black">
                    {totalAmount} <span className="text-sm font-bold">MAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes if any */}
          {payment.notes && (
            <div className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] print-border text-xs">
              <span className="text-[#958B9F] print-black font-semibold">Note / Référence: </span>
              <span className="text-[#E0D8EB] print-black italic">{payment.notes}</span>
            </div>
          )}

          {/* Watermark / Legal Slip footer */}
          <div className="pt-2 text-center text-[10px] text-slate-500 print-black space-y-0.5">
            <p>Ce document tient lieu de justificatif de paiement d'accès au réseau Youness WiFi.</p>
            <p className="font-mono">Merci pour votre confiance • Connexion garantie et active jusqu'au {payment.newDueDate}</p>
          </div>
        </div>

        {/* Footer Actions (Non-printable) */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#130F1A]/95 border-t border-[#2D253B]/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 no-print shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] border border-[#3A2F4C] text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimer (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] border border-[#3A2F4C] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#958B9F]" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#958B9F] hover:text-[#F4F0F8] text-xs font-semibold transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
