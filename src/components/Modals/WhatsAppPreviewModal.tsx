'use client';

import Dialog from '@/components/ui/Dialog';

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
  const { getWhatsAppReminderUrl, language } = useStore();
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
    <Dialog onClose={onClose} label="Whats App Preview">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl bg-[var(--surface)] sm:border sm:border-[var(--border)]/70 rounded-none sm:rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--border)]/70 bg-[var(--surface-muted)]/95 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20 shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2">
                <span>WhatsApp Billing Reminder</span>
                <span className="text-[12px] sm:text-sm font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-[var(--success)] border border-emerald-800/60">
                  Bilingual
                </span>
              </h3>
              <p className="text-[12px] sm:text-sm text-[var(--muted)]">
                Itemized invoice calculation & direct WhatsApp dispatch
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

        {/* Client Status Pill */}
        <div className="px-4 sm:px-6 py-2.5 bg-[var(--surface-muted)] border-b border-[var(--border)]/70 flex items-center justify-between gap-2 text-sm overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[var(--muted)]">Recipient:</span>
            <span className="font-semibold text-[var(--text)]">{client.name}</span>
            <span className="text-[var(--muted)] font-mono">({baseFee} MAD/mo)</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[var(--muted)] flex items-center gap-1 font-mono">
              <Phone className="w-3.5 h-3.5 text-[var(--success)]" />
              +{cleanPhone}
            </span>
            {daysDiff < 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-rose-500/15 text-[var(--error)] border border-rose-500/30">
                <AlertTriangle className="w-3 h-3" />
                {Math.abs(daysDiff)}d Overdue • {totalDue} MAD
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--accent-border)]">
                <Clock className="w-3 h-3" />
                Due in {daysDiff}d • {totalDue} MAD
              </span>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 overflow-x-hidden">
          {/* Optional Extra Charges Accordion */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Include Extra Charges / Frais Supplémentaires
                </span>
                <p className="text-[12px] text-[var(--muted)] mt-0.5">
                  Append late fees or equipment adjustments with itemized breakdown
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIncludeExtra(!includeExtra)}
                className={`px-2.5 py-1 rounded-lg text-sm font-semibold flex items-center gap-1 transition cursor-pointer ${
                  includeExtra
                    ? 'bg-rose-500/20 text-[var(--error)] border border-rose-500/30'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-[var(--success)] border border-emerald-500/20'
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
              <div className="pt-2 border-t border-[var(--border)] space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="block text-[var(--muted)] font-semibold mb-1" htmlFor="WhatsAppPreviewModal-field-0">
                      Extra Fee Amount (MAD)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="5"
                      value={extraAmount}
                      onChange={(e) => setExtraAmount(Number(e.target.value))}
                      className="w-full bg-[var(--background)] border border-[var(--border)]/70 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text)] font-mono font-bold focus:outline-none focus:border-amber-500/50"
                      id="WhatsAppPreviewModal-field-0"/>
                  </div>

                  <div>
                    <label className="block text-[var(--muted)] font-semibold mb-1" htmlFor="WhatsAppPreviewModal-field-1">
                      Reason / Motif
                    </label>
                    <select
                      value={extraReason}
                      onChange={(e) => setExtraReason(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border)]/70 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text)] focus:outline-none focus:border-amber-500/50"
                      id="WhatsAppPreviewModal-field-1">
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
                      className="w-full bg-[var(--background)] border border-[var(--border)]/70 rounded-lg px-2.5 py-1.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50"
                     aria-label="Specify custom reason..."/>
                  </div>
                )}

                <div className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-between text-sm font-mono">
                  <span className="text-[var(--muted)]">Total Reminder Amount:</span>
                  <span className="text-[var(--success)] font-bold">
                    {baseFee} (Base) + {effectiveExtra} (Extra) = {totalDue} MAD
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Message Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-[var(--muted)]">
              <span className="font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[var(--success)]" />
                Live Pre-Filled WhatsApp Message:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-emerald-400 transition cursor-pointer"
               aria-label="Copier">
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                    <span className="text-[var(--success)] font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-sm sm:text-sm text-[var(--text)] whitespace-pre-line leading-relaxed font-sans shadow-inner selection:bg-emerald-500/30 selection:text-emerald-200">
              {text}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--accent-soft)]/40 border border-[var(--accent-border)] text-sm text-[var(--primary)] flex items-start gap-2.5">
            <span className="text-base leading-none">💡</span>
            <p>
              {cleanPhone ? (
                <>
                  Clicking <strong className="text-[var(--text)]">&quot;Launch WhatsApp&quot;</strong> will open
                  the official WhatsApp chat with <strong>+{cleanPhone}</strong> and pre-load this
                  exact bilingual message in the chat input.
                </>
              ) : (
                <>
                  Cet abonné n&apos;a pas de numéro de téléphone enregistré. Vous pouvez copier le message ci-dessus pour le transmettre manuellement.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 bg-[var(--surface-muted)]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 z-10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 text-sm sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] rounded-xl transition cursor-pointer order-3 sm:order-1"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[44px] px-4 py-2.5 text-sm sm:text-sm font-medium bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-xl transition flex items-center justify-center gap-2 border border-[var(--border)] cursor-pointer order-2 sm:order-2"
           aria-label="Copier">
            {copied ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié' : 'Copier'}</span>
          </button>

          {cleanPhone ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex-1 sm:flex-initial min-h-[48px] px-5 py-3 text-sm sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer order-1 sm:order-3"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Envoyer WhatsApp</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 sm:flex-initial min-h-[48px] px-5 py-3 text-sm sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--muted)] border border-[var(--border)] rounded-xl transition flex items-center justify-center gap-2 cursor-not-allowed opacity-60 order-1 sm:order-3"
              title="Numéro de téléphone non renseigné"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Numéro non renseigné</span>
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
