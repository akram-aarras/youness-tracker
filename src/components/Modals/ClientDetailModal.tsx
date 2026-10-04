'use client';

import React, { useState } from 'react';
import { Client } from '@/lib/types';
import { useStore, getDaysDiffFromToday } from '@/lib/store';
import {
  X,
  Radio,
  Wifi,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Wrench,
  Clock,
  AlertTriangle,
  Edit3,
  Save,
  Receipt,
} from 'lucide-react';
import InvoiceReceiptModal from './InvoiceReceiptModal';
import { PaymentLog } from '@/lib/types';

interface Props {
  client: Client;
  onClose: () => void;
  onRecordPayment: (clientId: string) => void;
  onSendWhatsApp: (client: Client) => void;
  onCreateTicket: (clientId: string) => void;
}

export default function ClientDetailModal({
  client,
  onClose,
  onRecordPayment,
  onSendWhatsApp,
  onCreateTicket,
}: Props) {
  const { payments, updateClient } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Editable pricing states
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [editFee, setEditFee] = useState<number>(client.monthlyFee || 100);
  const [editPlan, setEditPlan] = useState<string>(client.subscriptionPlan || '');
  const [rateUpdatedSuccess, setRateUpdatedSuccess] = useState(false);

  // Selected payment for viewing/printing invoice slip
  const [selectedPaymentForSlip, setSelectedPaymentForSlip] = useState<PaymentLog | null>(null);

  // Sync editFee if client prop changes
  React.useEffect(() => {
    setEditFee(client.monthlyFee || 100);
    setEditPlan(client.subscriptionPlan || '');
  }, [client.id, client.monthlyFee, client.subscriptionPlan]);

  const handleSaveFee = () => {
    const feeNum = Number(editFee);
    if (feeNum > 0) {
      updateClient(client.id, {
        monthlyFee: feeNum,
        subscriptionPlan: editPlan.trim() || client.subscriptionPlan,
      });
      setIsEditingFee(false);
      setRateUpdatedSuccess(true);
      setTimeout(() => setRateUpdatedSuccess(false), 3000);
    }
  };

  const clientPayments = payments.filter((p) => p.clientId === client.id);
  const daysDiff = getDaysDiffFromToday(client.nextDueDate);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Signal color meter
  const getSignalBadge = (dbm: number) => {
    if (dbm >= -60) {
      return {
        label: 'Excellent',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
        barWidth: '92%',
        barColor: 'bg-emerald-500',
      };
    } else if (dbm >= -70) {
      return {
        label: 'Good / Stable',
        color: 'text-blue-400 bg-blue-950/60 border-blue-800',
        barWidth: '75%',
        barColor: 'bg-blue-500',
      };
    } else if (dbm >= -78) {
      return {
        label: 'Marginal',
        color: 'text-amber-400 bg-amber-950/60 border-amber-800',
        barWidth: '50%',
        barColor: 'bg-amber-500',
      };
    } else {
      return {
        label: 'Poor / Misaligned',
        color: 'text-rose-400 bg-rose-950/60 border-rose-800',
        barWidth: '25%',
        barColor: 'bg-rose-500',
      };
    }
  };

  const signal = getSignalBadge(client.hardware?.signalStrengthDbm ?? -65);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-base">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{client.name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {client.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3 h-3 text-cyan-400" />
                {client.neighborhood || 'Tétouan'} {client.address ? `— ${client.address}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Strip */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${client.phone}`}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Call ({client.phone})
            </a>
            <a
              href={client.googleMapsUrl || 'https://maps.google.com/?q=35.5784,-5.3684'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              Google Maps
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSendWhatsApp(client)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Reminder
            </button>
            <button
              onClick={() => onRecordPayment(client.id)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition font-medium shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Subscription Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 relative">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Plan & Monthly Rate
                </div>
                {!isEditingFee && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditFee(client.monthlyFee || 100);
                      setEditPlan(client.subscriptionPlan || '');
                      setIsEditingFee(true);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition text-[11px] flex items-center gap-1 cursor-pointer"
                    title="Edit base monthly rate"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Rate</span>
                  </button>
                )}
              </div>

              {isEditingFee ? (
                <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                      Base Fee (MAD / month)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        step="5"
                        value={editFee}
                        onChange={(e) => setEditFee(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                        autoFocus
                      />
                      <span className="text-xs text-slate-400 font-bold">MAD</span>
                    </div>
                  </div>

                  {/* Quick override presets */}
                  <div className="flex items-center gap-1 text-[10px]">
                    {[100, 120, 150, 200].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setEditFee(preset)}
                        className={`px-1.5 py-0.5 rounded border font-mono transition ${
                          editFee === preset
                            ? 'bg-cyan-600 border-cyan-500 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value)}
                      placeholder="e.g. 30 Mbps Fiber-Air"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveFee}
                      className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingFee(false)}
                      className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-bold text-white mt-1">
                    {client.subscriptionPlan}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {client.monthlyFee || 100} MAD / month
                    </span>
                    {(client.monthlyFee || 100) !== 100 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                        Custom Rate
                      </span>
                    )}
                  </div>
                  {rateUpdatedSuccess && (
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1 animate-pulse">
                      ✓ Rate updated successfully
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Billing Due Date
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {client.nextDueDate}
              </div>
              <div className="text-xs mt-0.5">
                {daysDiff < 0 ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {Math.abs(daysDiff)} days overdue
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due in {daysDiff} days
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Installation Date
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {client.installationDate}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Last Paid: {client.lastPaymentDate}
              </div>
            </div>
          </div>

          {/* Hardware & Wireless Telemetry */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Radio className="w-4 h-4" />
                Wireless Link & CPE Hardware
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${signal.color}`}
              >
                {client.hardware.signalStrengthDbm} dBm • {signal.label}
              </span>
            </div>

            {/* Signal Strength Visual Progress */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Signal Quality Level</span>
                <span className="font-mono text-white font-semibold">
                  {client.hardware.signalStrengthDbm} dBm
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${signal.barColor}`}
                  style={{ width: signal.barWidth }}
                />
              </div>
            </div>

            {/* Hardware Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Antenna Model
                </span>
                <span className="font-semibold text-white">
                  {client.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Antenna MAC Address
                  </span>
                  <span className="font-mono font-semibold text-cyan-300">
                    {client.hardware?.antennaMac || 'N/A'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(client.hardware?.antennaMac || 'N/A', 'mac')
                  }
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  {copiedField === 'mac' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Connected Sector / Tower AP
                </span>
                <span className="font-semibold text-white">
                  {client.hardware?.sectorTower || 'Tour Boujarah (Relais Centre)'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  CPE Management IP
                </span>
                <span className="font-mono font-semibold text-slate-300">
                  {client.hardware?.antennaIp || '192.168.10.150'}
                </span>
              </div>
            </div>
          </div>

          {/* Wi-Fi & PPPoE Network Credentials */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800/80 pb-2.5">
              <Wifi className="w-4 h-4" />
              Indoor Router & PPPoE Authentication
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  Indoor Router Model
                </span>
                <span className="font-semibold text-white">
                  {client.hardware?.routerModel || 'Standard Router'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    Customer Wi-Fi SSID
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {client.hardware?.wifiSsid || 'N/A'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(client.hardware?.wifiSsid || 'N/A', 'ssid')
                  }
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  {copiedField === 'ssid' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    PPPoE Username
                  </span>
                  <span className="font-mono font-semibold text-white">
                    {client.hardware?.pppoeUsername || 'N/A'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(client.hardware?.pppoeUsername || 'N/A', 'pppoe_user')
                  }
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  {copiedField === 'pppoe_user' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    PPPoE Password
                  </span>
                  <span className="font-mono font-semibold text-white">
                    {showPassword
                      ? client.hardware?.pppoePassword || '123456'
                      : '••••••••••'}
                  </span>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        client.hardware?.pppoePassword || '123456',
                        'pppoe_pwd'
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    {copiedField === 'pppoe_pwd' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Notes */}
          {client.notes && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-500 uppercase font-bold block mb-1">
                Technician Notes:
              </span>
              <p className="text-slate-300 italic">{client.notes}</p>
            </div>
          )}

          {/* Payment History for this client */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Payment Ledger History ({clientPayments.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Itemized invoices & receipts</span>
            </div>
            {clientPayments.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                No past payment logs on record.
              </div>
            ) : (
              <div className="space-y-2">
                {clientPayments.map((p) => {
                  const hasExtra = (p.extraAmount ?? 0) > 0;
                  const itemBaseFee = p.baseFee ?? (p.amount - (p.extraAmount ?? 0));
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">
                            {p.receiptNumber}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold font-mono">
                            PAID
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {p.paymentDate} • Via {p.method.replace('_', ' ').toUpperCase()} • Rec. by{' '}
                          {p.recordedBy}
                        </div>

                        {/* Itemized calculation breakdown */}
                        <div className="text-[11px] text-slate-300 mt-1 flex flex-wrap items-center gap-1.5 font-mono">
                          <span className="text-slate-400">Base:</span>
                          <span className="text-white font-semibold">{itemBaseFee} MAD</span>
                          {hasExtra && (
                            <>
                              <span>+</span>
                              <span className="text-blue-400 font-semibold">
                                {p.extraAmount} MAD
                              </span>
                              <span className="text-[10px] text-blue-300/80 font-sans italic">
                                ({p.extraReason || 'Frais extra'})
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          +{p.amount} MAD
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Extended to {p.newDueDate}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentForSlip(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer mt-0.5"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>View Slip</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onCreateTicket(client.id)}
            className="px-3.5 py-2 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            Create Incident Ticket
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Slip Preview Modal */}
      {selectedPaymentForSlip && (
        <InvoiceReceiptModal
          payment={selectedPaymentForSlip}
          client={client}
          onClose={() => setSelectedPaymentForSlip(null)}
        />
      )}
    </div>
  );
}
