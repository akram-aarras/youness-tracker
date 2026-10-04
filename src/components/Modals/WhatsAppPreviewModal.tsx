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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>WhatsApp Billing Reminder</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Bilingual FR / Darija
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Itemized invoice calculation & direct WhatsApp dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Status Pill */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Recipient:</span>
            <span className="font-semibold text-white">{client.name}</span>
            <span className="text-slate-500 font-mono">({baseFee} MAD/mo)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1 font-mono">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              +{cleanPhone}
            </span>
            {daysDiff < 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-3 h-3" />
                {Math.abs(daysDiff)}d Overdue • {totalDue} MAD
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Clock className="w-3 h-3" />
                Due in {daysDiff}d • {totalDue} MAD
              </span>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Optional Extra Charges Accordion */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Include Extra Charges / Frais Supplémentaires
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
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
              <div className="pt-2 border-t border-slate-800 space-y-3 animate-in fade-in duration-150">
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Reason / Motif
                    </label>
                    <select
                      value={extraReason}
                      onChange={(e) => setExtraReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Reminder Amount:</span>
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
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans shadow-inner selection:bg-emerald-500/30 selection:text-emerald-200">
              {text}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 flex items-start gap-2.5">
            <span className="text-base leading-none">💡</span>
            <p>
              Clicking <strong className="text-white">"Launch WhatsApp"</strong> will open
              the official WhatsApp chat with <strong>+{cleanPhone}</strong> and pre-load this
              exact bilingual message in the chat input.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center gap-2 border border-slate-700 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Launch WhatsApp (wa.me)
          </a>
        </div>
      </div>
    </div>
  );
}
