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
  Archive,
  Trash2,
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
  const { payments, updateClient, deleteClient, archiveClient } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Archive and Delete confirmation states
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-[#191522] sm:border sm:border-[#2D253B]/70 rounded-none sm:rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#2D253B]/70 bg-[#130F1A]/95 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-base shrink-0">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#F4F0F8] truncate">{client.name}</h3>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-mono bg-[#241E30] text-[#E0D8EB] border border-[#3A2F4C] shrink-0">
                  {client.id}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#958B9F] flex items-center gap-1.5 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{client.neighborhood || 'Tétouan'} {client.address ? `— ${client.address}` : ''}</span>
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

        {/* Quick Action Strip */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#130F1A]/80 border-b border-[#2D253B]/70 flex items-center justify-between gap-2 text-xs overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${client.phone}`}
              className="px-3 py-1.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] border border-[#3A2F4C] flex items-center gap-1.5 transition font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Appeler ({client.phone})</span>
            </a>
            <a
              href={client.googleMapsUrl || 'https://maps.google.com/?q=35.5784,-5.3684'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] border border-[#3A2F4C] flex items-center gap-1.5 transition font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#958B9F]" />
              Google Maps
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSendWhatsApp(client)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition font-medium cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Reminder
            </button>
            <button
              onClick={() => onRecordPayment(client.id)}
              className="px-3 py-1.5 rounded-xl bg-[#241E30] hover:bg-[#2C243B] border border-[#3A2F4C] text-[#E0D8EB] flex items-center gap-1.5 transition font-medium shadow-sm cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 overflow-x-hidden">
          {/* Subscription Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#130F1A] border border-[#261E33] relative">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#958B9F]">
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
                    className="p-1 rounded text-[#958B9F] hover:text-amber-400 hover:bg-[#241E30] transition text-[11px] flex items-center gap-1 cursor-pointer"
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
                    <label className="text-[10px] uppercase font-semibold text-[#958B9F] block mb-1">
                      Base Fee (MAD / month)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        step="5"
                        value={editFee}
                        onChange={(e) => setEditFee(Number(e.target.value))}
                        className="w-full bg-[#0F0C14] border border-[#2D253B]/70 rounded-lg px-2.5 py-1.5 text-xs text-[#F4F0F8] font-mono font-bold focus:outline-none focus:border-amber-500/50"
                        autoFocus
                      />
                      <span className="text-xs text-[#958B9F] font-bold">MAD</span>
                    </div>
                  </div>

                  {/* Quick override presets */}
                  <div className="flex items-center gap-1 text-[10px]">
                    {[100, 120, 150, 200].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setEditFee(preset)}
                        className={`px-1.5 py-0.5 rounded border font-mono transition cursor-pointer ${
                          editFee === preset
                            ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                            : 'bg-[#0F0C14] border-[#2D253B]/70 text-[#958B9F] hover:text-[#F4F0F8]'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-[#958B9F] block mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value)}
                      placeholder="e.g. 30 Mbps Fiber-Air"
                      className="w-full bg-[#0F0C14] border border-[#2D253B]/70 rounded-lg px-2.5 py-1 text-xs text-[#F4F0F8] focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveFee}
                      className="flex-1 py-1 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingFee(false)}
                      className="py-1 px-2 rounded-lg bg-[#241E30] hover:bg-[#2C243B] text-[#958B9F] hover:text-[#F4F0F8] text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-bold text-[#F4F0F8] mt-1">
                    {client.subscriptionPlan}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {client.monthlyFee || 100} MAD / month
                    </span>
                    {(client.monthlyFee || 100) !== 100 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#382647] text-[#F3E8FF] border border-[#523368] font-semibold">
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

            <div className="p-3.5 rounded-xl bg-[#130F1A] border border-[#261E33]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#958B9F]">
                Billing Due Date
              </div>
              <div className="text-sm font-bold text-[#F4F0F8] font-mono mt-1">
                {client.nextDueDate}
              </div>
              <div className="text-xs mt-0.5">
                {client.status === 'archived' ? (
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Archive className="w-3 h-3" />
                    حساب مؤرشف (Exclu des impayés)
                  </span>
                ) : daysDiff < 0 ? (
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

            <div className="p-3.5 rounded-xl bg-[#130F1A] border border-[#261E33]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#958B9F]">
                Installation Date
              </div>
              <div className="text-sm font-bold text-[#F4F0F8] font-mono mt-1">
                {client.installationDate}
              </div>
              <div className="text-xs text-[#958B9F] mt-0.5">
                Last Paid: {client.lastPaymentDate}
              </div>
            </div>
          </div>

          {/* Hardware & Wireless Telemetry */}
          <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-4">
            <div className="flex items-center justify-between border-b border-[#261E33] pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
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
              <div className="flex justify-between text-xs text-[#958B9F] mb-1">
                <span>Signal Quality Level</span>
                <span className="font-mono text-[#F4F0F8] font-semibold">
                  {client.hardware.signalStrengthDbm} dBm
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#191522] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${signal.barColor}`}
                  style={{ width: signal.barWidth }}
                />
              </div>
            </div>

            {/* Hardware Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33]">
                <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                  Antenna Model
                </span>
                <span className="font-semibold text-[#F4F0F8]">
                  {client.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33] flex items-center justify-between">
                <div>
                  <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                    Antenna MAC Address
                  </span>
                  <span className="font-mono font-semibold text-amber-300">
                    {client.hardware?.antennaMac || 'N/A'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(client.hardware?.antennaMac || 'N/A', 'mac')
                  }
                  className="p-1.5 text-[#958B9F] hover:text-[#F4F0F8] cursor-pointer"
                >
                  {copiedField === 'mac' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33]">
                <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                  Connected Sector / Tower AP
                </span>
                <span className="font-semibold text-[#F4F0F8]">
                  {client.hardware?.sectorTower || 'Tour Boujarah (Relais Centre)'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33]">
                <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                  CPE Management IP
                </span>
                <span className="font-mono font-semibold text-[#E0D8EB]">
                  {client.hardware?.antennaIp || '192.168.10.150'}
                </span>
              </div>
            </div>
          </div>

          {/* Wi-Fi & PPPoE Network Credentials */}
          <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-[#261E33] pb-2.5">
              <Wifi className="w-4 h-4" />
              Indoor Router & PPPoE Authentication
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33]">
                <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                  Indoor Router Model
                </span>
                <span className="font-semibold text-[#F4F0F8]">
                  {client.hardware?.routerModel || 'Standard Router'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33] flex items-center justify-between">
                <div>
                  <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
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
                  className="p-1.5 text-[#958B9F] hover:text-[#F4F0F8] cursor-pointer"
                >
                  {copiedField === 'ssid' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33] flex items-center justify-between">
                <div>
                  <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                    PPPoE Username
                  </span>
                  <span className="font-mono font-semibold text-[#F4F0F8]">
                    {client.hardware?.pppoeUsername || 'N/A'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(client.hardware?.pppoeUsername || 'N/A', 'pppoe_user')
                  }
                  className="p-1.5 text-[#958B9F] hover:text-[#F4F0F8] cursor-pointer"
                >
                  {copiedField === 'pppoe_user' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33] flex items-center justify-between">
                <div>
                  <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                    PPPoE Password
                  </span>
                  <span className="font-mono font-semibold text-[#F4F0F8]">
                    {showPassword
                      ? client.hardware?.pppoePassword || '123456'
                      : '••••••••••'}
                  </span>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-[#958B9F] hover:text-[#F4F0F8] cursor-pointer"
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
                    className="p-1.5 text-[#958B9F] hover:text-[#F4F0F8] cursor-pointer"
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
            <div className="p-3.5 rounded-xl bg-[#130F1A] border border-[#261E33] text-xs">
              <span className="text-[#958B9F] uppercase font-bold block mb-1">
                Technician Notes:
              </span>
              <p className="text-[#E0D8EB] italic">{client.notes}</p>
            </div>
          )}

          {/* Payment History for this client */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#958B9F] mb-2 flex items-center justify-between">
              <span>Payment Ledger History ({clientPayments.length})</span>
              <span className="text-[10px] text-[#958B9F]/70 font-normal">Itemized invoices & receipts</span>
            </div>
            {clientPayments.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] text-center text-xs text-[#958B9F]">
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
                      className="p-3 rounded-xl bg-[#130F1A] border border-[#261E33] hover:border-[#3A2F4C] transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#F4F0F8]">
                            {p.receiptNumber}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold font-mono">
                            PAID
                          </span>
                        </div>
                        <div className="text-[11px] text-[#958B9F] mt-0.5">
                          {p.paymentDate} • Via {p.method.replace('_', ' ').toUpperCase()} • Rec. by{' '}
                          {p.recordedBy}
                        </div>

                        {/* Itemized calculation breakdown */}
                        <div className="text-[11px] text-[#E0D8EB] mt-1 flex flex-wrap items-center gap-1.5 font-mono">
                          <span className="text-[#958B9F]">Base:</span>
                          <span className="text-[#F4F0F8] font-semibold">{itemBaseFee} MAD</span>
                          {hasExtra && (
                            <>
                              <span>+</span>
                              <span className="text-amber-400 font-semibold">
                                {p.extraAmount} MAD
                              </span>
                              <span className="text-[10px] text-amber-300/80 font-sans italic">
                                ({p.extraReason || 'Frais extra'})
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#261E33]">
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          +{p.amount} MAD
                        </div>
                        <div className="text-[10px] text-[#958B9F] font-mono">
                          Extended to {p.newDueDate}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentForSlip(p)}
                          className="px-2.5 py-1 rounded-lg bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] hover:text-[#F4F0F8] border border-[#3A2F4C] text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer mt-0.5"
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

          {/* Account Lifecycle & Administration (أرشفة المشترك وحذف الحساب) */}
          <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-[#958B9F] flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>إدارة حالة المشترك والعمليات الإدارية (Gestion du Compte)</span>
              </div>
              {client.status === 'archived' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#261E33] text-slate-300 border border-slate-700">
                  مشترك مؤرشف
                </span>
              )}
            </div>

            <p className="text-xs text-[#958B9F]">
              يمكنك أرشفة المشترك عند إنهاء العقد لإيقاف احتساب الديون والمتأخرات التراكمية، أو حذفه نهائياً من قاعدة البيانات.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {/* Archive Button */}
              {client.status !== 'archived' ? (
                <button
                  type="button"
                  onClick={() => setShowArchiveConfirm(true)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-400" />
                  <span>أرشفة المشترك (Archiver)</span>
                </button>
              ) : (
                <span className="text-xs text-amber-400/80 font-medium flex items-center gap-1.5 py-1">
                  <Check className="w-4 h-4 text-amber-400" />
                  المشترك في الأرشيف حالياً (معفى من المتأخرات)
                </span>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>حذف نهائي (Supprimer définitivement)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-[#130F1A]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#261E33] flex items-center justify-between gap-3 z-10 shrink-0">
          <button
            type="button"
            onClick={() => onCreateTicket(client.id)}
            className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-amber-400 bg-[#241E30] hover:bg-[#2C243B] border border-[#3A2F4C] rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Créer تذكرة عطل</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 text-xs font-medium text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30] rounded-xl transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#191522] border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Archive className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#F4F0F8]">تأكيد أرشفة المشترك</h4>
                <p className="text-xs text-[#958B9F]">Confirmer l'archivage de l'abonné</p>
              </div>
            </div>

            <p className="text-xs text-[#E0D8EB] leading-relaxed">
              هل أنت متأكد من رغبتك في أرشفة المشترك <strong className="text-amber-400 font-bold">{client.name}</strong>؟
              <br />
              سيتم إيقاف احتساب الاشتراكات والمتأخرات التراكمية، واستبعاده من لوحة العمليات العاجلة مع الاحتفاظ بسجلاته.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#958B9F] hover:text-[#F4F0F8] text-xs font-semibold transition cursor-pointer"
              >
                إلغاء (Annuler)
              </button>
              <button
                type="button"
                onClick={() => {
                  archiveClient(client.id);
                  setShowArchiveConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>تأكيد الأرشفة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#191522] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-rose-400">تحذير: حذف المشترك نهائياً</h4>
                <p className="text-xs text-[#958B9F]">Suppression définitive de l'abonné</p>
              </div>
            </div>

            <p className="text-xs text-[#E0D8EB] leading-relaxed">
              هل أنت متأكد من حذف المشترك <strong className="text-rose-400 font-bold">{client.name}</strong> نهائياً من النظام؟
              <br />
              <span className="text-rose-400/90 font-medium">⚠️ هذا الإجراء لا يمكن التراجع عنه وسيتم مسح بيانات المشترك بالكامل.</span>
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#958B9F] hover:text-[#F4F0F8] text-xs font-semibold transition cursor-pointer"
              >
                إلغاء (Annuler)
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteClient(client.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>نعم، حذف نهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
