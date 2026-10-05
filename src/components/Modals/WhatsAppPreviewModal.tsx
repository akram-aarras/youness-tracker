'use client';

import React, { useState } from 'react';
import { Client } from '@/lib/types';
import { useStore, getDaysDiffFromToday } from '@/lib/store';
import {
  X,
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
  AlertTriangle,
  Clock,
  Phone,
  Plus,
  Trash2,
  Calculator,
} from 'lucide-react';

interface Props {
  client: Client;
  onClose: () => void;
}

const EXTRA_FEE_PRESETS = [
  'Late payment fee',
  'Extra days prorated',
  'Replacement cable / adapter',
  'Temporary speed boost',
  'Technical maintenance',
  'Custom adjustment',
];

export default function WhatsAppPreviewModal({ client, onClose }: Props) {
  const { getWhatsAppReminderUrl } = useStore();
  const [copied, setCopied] = useState(false);

  // Extra charges state
  const [includeExtra, setIncludeExtra] = useState(false);
  const [extraAmount, setExtraAmount] = useState<number>(20);
  const [extraReason, setExtraReason] = useState<string>('Late payment fee');
  const [customReason, setCustomReason] = useState<string>('');

  const baseFee = client.monthlyFee || 100;
  const effectiveReason =
    extraReason === 'Custom adjustment'
      ? (customReason.trim() || 'Ajustement exceptionnel')
      : extraReason;
  const effectiveExtra = includeExtra && Number(extraAmount) > 0 ? Number(extraAmount) : 0;
  const totalDue = baseFee + effectiveExtra;

  const { url, text, cleanPhone } = getWhatsAppReminderUrl(
    client,
    includeExtra && effectiveExtra > 0
      ? { amount: effectiveExtra, reason: effectiveReason }
      : undefined
  );

  const daysDiff = getDaysDiffFromToday(client.nextDueDate);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl bg-[#191522] sm:border sm:border-[#2D253B]/70 rounded-none sm:rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#2D253B]/70 bg-[#130F1A]/95 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F4F0F8] flex items-center gap-2">
                <span>WhatsApp Billing Reminder</span>
                <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                  Bilingual
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-[#958B9F]">
                Itemized invoice calculation & direct WhatsApp dispatch
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

        {/* Client Status Pill */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#130F1A] border-b border-[#2D253B]/70 flex items-center justify-between gap-2 text-xs overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[#958B9F]">Recipient:</span>
            <span className="font-semibold text-[#F4F0F8]">{client.name}</span>
            <span className="text-[#958B9F] font-mono">({baseFee} MAD/mo)</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[#958B9F] flex items-center gap-1 font-mono">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              +{cleanPhone}
            </span>
            {daysDiff < 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-3 h-3" />
                {Math.abs(daysDiff)}d Overdue • {totalDue} MAD
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-[#382647] text-[#F3E8FF] border border-[#523368]">
                <Clock className="w-3 h-3" />
                Due in {daysDiff}d • {totalDue} MAD
              </span>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 overflow-x-hidden">
          {/* Optional Extra Charges Accordion */}
          <div className="p-3.5 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E0D8EB]">
                  Include Extra Charges / Frais Supplémentaires
                </span>
                <p className="text-[11px] text-[#958B9F] mt-0.5">
                  Append late fees or equipment adjustments with itemized breakdown
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIncludeExtra(!includeExtra)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  includeExtra
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {includeExtra ? (
                  <>
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Extra Fee</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>+ Add Extra Fee</span>
                  </>
                )}
              </button>
            </div>

            {includeExtra && (
              <div className="pt-2 border-t border-[#261E33] space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Extra Fee Amount (MAD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="5"
                      value={extraAmount}
                      onChange={(e) => setExtraAmount(Number(e.target.value))}
                      className="w-full bg-[#0F0C14] border border-[#2D253B]/70 rounded-lg px-2.5 py-1.5 text-xs text-[#F4F0F8] font-mono font-bold focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[#958B9F] font-semibold mb-1">
                      Reason / Motif
                    </label>
                    <select
                      value={extraReason}
                      onChange={(e) => setExtraReason(e.target.value)}
                      className="w-full bg-[#0F0C14] border border-[#2D253B]/70 rounded-lg px-2.5 py-1.5 text-xs text-[#F4F0F8] focus:outline-none focus:border-amber-500/50"
                    >
                      {EXTRA_FEE_PRESETS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {extraReason === 'Custom adjustment' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Specify custom reason..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full bg-[#0F0C14] border border-[#2D253B]/70 rounded-lg px-2.5 py-1.5 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                )}

                <div className="p-2 rounded-lg bg-[#0F0C14] border border-[#261E33] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#958B9F]">Total Reminder Amount:</span>
                  <span className="text-emerald-400 font-bold">
                    {baseFee} (Base) + {effectiveExtra} (Extra) = {totalDue} MAD
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Message Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                Live Pre-Filled WhatsApp Message:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[#0F0C14] border border-[#261E33] text-xs sm:text-sm text-[#F4F0F8] whitespace-pre-line leading-relaxed font-sans shadow-inner selection:bg-emerald-500/30 selection:text-emerald-200">
              {text}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#382647]/40 border border-[#523368] text-xs text-[#F3E8FF] flex items-start gap-2.5">
            <span className="text-base leading-none">💡</span>
            <p>
              Clicking <strong className="text-white">"Launch WhatsApp"</strong> will open
              the official WhatsApp chat with <strong>+{cleanPhone}</strong> and pre-load this
              exact bilingual message in the chat input.
            </p>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 bg-[#130F1A]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#261E33] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 z-10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-medium text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30] rounded-xl transition cursor-pointer order-3 sm:order-1"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-medium bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] rounded-xl transition flex items-center justify-center gap-2 border border-[#3A2F4C] cursor-pointer order-2 sm:order-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié' : 'Copier'}</span>
          </button>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex-1 sm:flex-initial min-h-[48px] px-5 py-3 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer order-1 sm:order-3"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Envoyer WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
