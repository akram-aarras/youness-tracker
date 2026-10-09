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
  const { currentUser, payments, updateClient, deleteClient, archiveClient, t, language, localizePlanName, dir } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const isAdmin = currentUser?.role === 'admin' || !currentUser;

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

  const clientPayments = React.useMemo(() => {
    return payments
      .filter((p) => p.clientId === client.id)
      .sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || '') || b.id.localeCompare(a.id));
  }, [payments, client.id]);
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
        label: t('signal_excellent'),
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
        barWidth: '92%',
        barColor: 'bg-emerald-500',
      };
    } else if (dbm >= -70) {
      return {
        label: t('signal_good'),
        color: 'text-blue-400 bg-blue-950/60 border-blue-800',
        barWidth: '75%',
        barColor: 'bg-blue-500',
      };
    } else if (dbm >= -78) {
      return {
        label: t('signal_marginal'),
        color: 'text-amber-400 bg-amber-950/60 border-amber-800',
        barWidth: '50%',
        barColor: 'bg-amber-500',
      };
    } else {
      return {
        label: t('signal_poor'),
        color: 'text-rose-400 bg-rose-950/60 border-rose-800',
        barWidth: '25%',
        barColor: 'bg-rose-500',
      };
    }
  };

  const signal = getSignalBadge(client.hardware?.signalStrengthDbm ?? -65);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-white dark:bg-slate-900 sm:border sm:border-slate-200/80 dark:sm:border-slate-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shrink-0">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center font-bold text-base shrink-0">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{client.name}</h3>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shrink-0">
                  {client.id}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                <span className="truncate">{client.neighborhood || 'Tétouan'} {client.address ? `— ${client.address}` : ''}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Strip */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            {client.phone ? (
              <a
                href={`tel:${client.phone}`}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 transition font-medium shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('call')} ({client.phone})</span>
              </a>
            ) : (
              <div
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700 flex items-center gap-1.5 text-xs font-medium cursor-default"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{language === 'ar' ? 'بدون هاتف' : 'Non renseigné'}</span>
              </div>
            )}
            <a
              href={client.googleMapsUrl || 'https://maps.google.com/?q=35.5784,-5.3684'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 transition font-medium shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{t('directions')}</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {client.phone ? (
              <button
                onClick={() => onSendWhatsApp(client)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 transition font-medium cursor-pointer shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('action_send_whatsapp')}</span>
              </button>
            ) : (
              <button
                disabled
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200/50 dark:border-slate-800 flex items-center gap-1.5 text-xs font-medium cursor-not-allowed opacity-50"
                title={language === 'ar' ? 'لا يوجد رقم هاتف' : 'Numéro non renseigné'}
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('action_send_whatsapp')}</span>
              </button>
            )}
            <button
              onClick={() => onRecordPayment(client.id)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center gap-1.5 transition font-semibold shadow-xs cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-white" />
              <span>{t('action_record_payment')}</span>
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
                  {t('plan_and_rate_title')}
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
                    title={t('edit_rate_btn')}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{t('edit_rate_btn')}</span>
                  </button>
                )}
              </div>

              {isEditingFee ? (
                <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-[#958B9F] block mb-1">
                      {t('base_fee_label')} (MAD)
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
                    {[50, 100, 120, 150, 200].map((preset) => (
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
                      {language === 'ar' ? 'اسم الباقة / الاشتراك' : language === 'fr' ? 'Nom du forfait' : 'Plan Name'}
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
                      {t('save')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingFee(false)}
                      className="py-1 px-2 rounded-lg bg-[#241E30] hover:bg-[#2C243B] text-[#958B9F] hover:text-[#F4F0F8] text-xs font-semibold transition cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-bold text-[#F4F0F8] mt-1">
                    {localizePlanName(client.subscriptionPlan, language)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {client.monthlyFee || 100} MAD
                    </span>
                    {(client.monthlyFee || 100) !== 100 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#382647] text-[#F3E8FF] border border-[#523368] font-semibold">
                        {t('custom_rate_badge')}
                      </span>
                    )}
                  </div>
                  {rateUpdatedSuccess && (
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1 animate-pulse">
                      ✓ {t('rate_updated_success_msg')}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-[#130F1A] border border-[#261E33]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#958B9F]">
                {t('billing_due_date_title')}
              </div>
              <div className="text-sm font-bold text-[#F4F0F8] font-mono mt-1">
                {client.nextDueDate}
              </div>
              <div className="text-xs mt-0.5">
                {client.status === 'archived' ? (
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Archive className="w-3 h-3" />
                    {t('archived_account_badge')}
                  </span>
                ) : daysDiff < 0 ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {t('days_overdue_text', { days: Math.abs(daysDiff) })}
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t('due_in_days_text', { days: daysDiff })}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#130F1A] border border-[#261E33]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#958B9F]">
                {t('installation_date_title')}
              </div>
              <div className="text-sm font-bold text-[#F4F0F8] font-mono mt-1">
                {client.installationDate}
              </div>
              <div className="text-xs text-[#958B9F] mt-0.5">
                {t('last_paid_label')} {client.lastPaymentDate || '—'}
              </div>
            </div>
          </div>

          {/* Hardware & Wireless Telemetry */}
          <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-4">
            <div className="flex items-center justify-between border-b border-[#261E33] pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Radio className="w-4 h-4" />
                {t('wireless_link_title')}
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
                <span>{t('signal_quality_label')}</span>
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
                  {t('antenna_model')}
                </span>
                <span className="font-semibold text-[#F4F0F8]">
                  {client.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33] flex items-center justify-between">
                <div>
                  <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                    {t('antenna_mac')}
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
                  {t('connected_sector_label')}
                </span>
                <span className="font-semibold text-[#F4F0F8]">
                  {client.hardware?.sectorTower || 'Tour Boujarah (Relais Centre)'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33]">
                <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                  {t('cpe_ip_label')}
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
              {t('indoor_router_title')}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33]">
                <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                  {t('indoor_router_model')}
                </span>
                <span className="font-semibold text-[#F4F0F8]">
                  {client.hardware?.routerModel || 'Standard Router'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33] flex items-center justify-between">
                <div>
                  <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                    {t('customer_wifi_ssid')}
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
                <div className="min-w-0 pr-2">
                  <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                    {language === 'ar' ? 'كلمة سر الواي فاي' : 'Mot de passe Wi-Fi'}
                  </span>
                  <span className="font-mono font-semibold text-[#F4F0F8] break-all">
                    {showWifiPassword
                      ? client.hardware?.wifiPassword || 'N/A'
                      : '••••••••••'}
                  </span>
                </div>
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowWifiPassword(!showWifiPassword)}
                    className="p-1.5 text-[#958B9F] hover:text-[#F4F0F8] cursor-pointer"
                  >
                    {showWifiPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        client.hardware?.wifiPassword || '',
                        'wifi_pwd'
                      )
                    }
                    className="p-1.5 text-[#958B9F] hover:text-[#F4F0F8] cursor-pointer"
                  >
                    {copiedField === 'wifi_pwd' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F0C14] border border-[#261E33] flex items-center justify-between">
                <div>
                  <span className="text-[#958B9F] block text-[10px] uppercase font-bold">
                    {t('pppoe_username_label')}
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
                    {t('pppoe_password_label')}
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
                {t('technician_notes_title')}
              </span>
              <p className="text-[#E0D8EB] italic">{client.notes}</p>
            </div>
          )}

          {/* Payment History for this client */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#958B9F] mb-2 flex items-center justify-between">
              <span>{t('payment_ledger_title', { count: clientPayments.length })}</span>
              <span className="text-[10px] text-[#958B9F]/70 font-normal">{t('payment_ledger_sub')}</span>
            </div>
            {clientPayments.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] text-center text-xs text-[#958B9F]">
                {t('no_past_payments')}
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
                            {t('filter_paid')}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#958B9F] mt-0.5">
                          {p.paymentDate} • Via {p.method.replace('_', ' ').toUpperCase()} • {p.recordedBy}
                        </div>

                        {/* Itemized calculation breakdown */}
                        <div className="text-[11px] text-[#E0D8EB] mt-1 flex flex-wrap items-center gap-1.5 font-mono">
                          <span className="text-[#958B9F]">{t('base_subscription_item')}</span>
                          <span className="text-[#F4F0F8] font-semibold">{itemBaseFee} MAD</span>
                          {hasExtra && (
                            <>
                              <span>+</span>
                              <span className="text-amber-400 font-semibold">
                                {p.extraAmount} MAD
                              </span>
                              <span className="text-[10px] text-amber-300/80 font-sans italic">
                                ({p.extraReason || 'Extra'})
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right rtl:sm:text-left flex sm:flex-col items-center sm:items-end justify-between gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#261E33]">
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          +{p.amount} MAD
                        </div>
                        <div className="text-[10px] text-[#958B9F] font-mono">
                          {p.newDueDate}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentForSlip(p)}
                          className="px-2.5 py-1 rounded-lg bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] hover:text-[#F4F0F8] border border-[#3A2F4C] text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer mt-0.5"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>{t('view_slip_btn')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account Lifecycle & Administration (Admin only) */}
          {isAdmin && (
            <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-[#958B9F] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>{t('account_lifecycle_title')}</span>
                </div>
                {client.status === 'archived' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#261E33] text-slate-300 border border-slate-700">
                    {t('archived_subscriber_pill')}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#958B9F]">
                {t('account_lifecycle_desc')}
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
                    <span>{t('archive_client_btn')}</span>
                  </button>
                ) : (
                  <span className="text-xs text-amber-400/80 font-medium flex items-center gap-1.5 py-1">
                    <Check className="w-4 h-4 text-amber-400" />
                    {t('archived_subscriber_notice')}
                  </span>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t('delete_client_btn')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-[#130F1A]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#261E33] flex items-center justify-between gap-3 z-10 shrink-0">
          <button
            type="button"
            onClick={() => onCreateTicket(client.id)}
            className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-amber-400 bg-[#241E30] hover:bg-[#2C243B] border border-[#3A2F4C] rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{t('create_trouble_ticket_btn')}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 text-xs font-medium text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30] rounded-xl transition cursor-pointer"
          >
            {t('close')}
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
                <h4 className="text-base font-bold text-[#F4F0F8]">{t('archive_confirm_title')}</h4>
                <p className="text-xs text-[#958B9F]">Youness WiFi</p>
              </div>
            </div>

            <p className="text-xs text-[#E0D8EB] leading-relaxed">
              {t('archive_confirm_msg', { name: client.name })}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#958B9F] hover:text-[#F4F0F8] text-xs font-semibold transition cursor-pointer"
              >
                {t('cancel')}
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
                <span>{t('archive_confirm_btn')}</span>
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
                <h4 className="text-base font-bold text-rose-400">{t('delete_confirm_title')}</h4>
                <p className="text-xs text-[#958B9F]">Youness WiFi</p>
              </div>
            </div>

            <p className="text-xs text-[#E0D8EB] leading-relaxed">
              {t('delete_modal_confirm_msg', { name: client.name })}
              <br />
              <span className="text-rose-400/90 font-medium">{t('delete_confirm_permanent_warning')}</span>
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[#241E30] hover:bg-[#2C243B] text-[#958B9F] hover:text-[#F4F0F8] text-xs font-semibold transition cursor-pointer"
              >
                {t('cancel')}
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
                <span>{t('delete_confirm_action_btn')}</span>
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
