'use client';

import React, { useState } from 'react';
import { useStore, isValidMoroccanPhone } from '@/lib/store';
import { Client, SubscriptionStatus } from '@/lib/types';
import {
  X,
  UserCheck,
  Radio,
  Wifi,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Server,
  Layers,
  FileText,
  Save,
  Loader2,
  Calendar,
} from 'lucide-react';
import {
  TETOUAN_NEIGHBORHOODS,
  ANTENNA_MODELS,
  ROUTER_MODELS,
  SECTOR_TOWERS,
} from './RegisterClientModal';

interface Props {
  client: Client;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export default function EditClientModal({ client, onClose, onSuccess }: Props) {
  const { updateClient } = useStore();

  const [activeTab, setActiveTab] = useState<'info' | 'hardware' | 'billing'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [showPppoePassword, setShowPppoePassword] = useState(false);

  // Tab 1: Client Info
  const [name, setName] = useState(client.name || '');
  const [phone, setPhone] = useState(client.phone || '');
  const [neighborhood, setNeighborhood] = useState(client.neighborhood || 'Wilaya');
  const [customNeighborhood, setCustomNeighborhood] = useState('');
  const [isCustomNeighborhood, setIsCustomNeighborhood] = useState(
    Boolean(client.neighborhood && !TETOUAN_NEIGHBORHOODS.includes(client.neighborhood))
  );
  const [address, setAddress] = useState(client.address || '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(client.googleMapsUrl || '');
  const [gpsCoordinates, setGpsCoordinates] = useState(client.gpsCoordinates || '');

  // Tab 2: Subscription & Billing
  const [monthlyFee, setMonthlyFee] = useState<number>(client.monthlyFee || 100);
  const [subscriptionPlan, setSubscriptionPlan] = useState(
    client.subscriptionPlan || 'باقة قياسية - 100 د.م./شهر (Pack Standard 100 MAD)'
  );
  const [status, setStatus] = useState<SubscriptionStatus>(client.status || 'active');
  const [nextDueDate, setNextDueDate] = useState(client.nextDueDate || '');
  const [installationDate, setInstallationDate] = useState(client.installationDate || '');
  const [notes, setNotes] = useState(client.notes || '');

  // Tab 3: Hardware & Network Details
  const [antennaModel, setAntennaModel] = useState(
    client.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'
  );
  const [antennaMac, setAntennaMac] = useState(client.hardware?.antennaMac || '');
  const [antennaIp, setAntennaIp] = useState(client.hardware?.antennaIp || '192.168.10.');
  const [sectorTower, setSectorTower] = useState(
    client.hardware?.sectorTower || 'Tour Boujarah (Relais Centre)'
  );
  const [signalStrengthDbm, setSignalStrengthDbm] = useState<number>(
    client.hardware?.signalStrengthDbm ?? -65
  );

  const [routerModel, setRouterModel] = useState(
    client.hardware?.routerModel || 'Standard Router'
  );
  const [wifiSsid, setWifiSsid] = useState(client.hardware?.wifiSsid || '');
  const [wifiPassword, setWifiPassword] = useState(client.hardware?.wifiPassword || '');

  const [pppoeUsername, setPppoeUsername] = useState(client.hardware?.pppoeUsername || '');
  const [pppoePassword, setPppoePassword] = useState(client.hardware?.pppoePassword || '');

  // Validation
  const isPhoneValid = isValidMoroccanPhone(phone);
  const isPhoneFilled = phone.trim().length > 0;
  const isNameFilled = name.trim().length > 0;
  const canSubmit = isNameFilled && isPhoneValid && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNameFilled) {
      setActiveTab('info');
      return;
    }

    if (!isPhoneValid) {
      setActiveTab('info');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedNeighborhood = isCustomNeighborhood
        ? customNeighborhood.trim() || client.neighborhood || 'Wilaya'
        : neighborhood;

      const updatedPayload: Partial<Client> = {
        name: name.trim(),
        phone: phone.trim(),
        neighborhood: selectedNeighborhood,
        address: address.trim() || undefined,
        googleMapsUrl: googleMapsUrl.trim() || undefined,
        gpsCoordinates: gpsCoordinates.trim() || undefined,
        monthlyFee: Number(monthlyFee) > 0 ? Number(monthlyFee) : 100,
        subscriptionPlan: subscriptionPlan.trim() || undefined,
        status,
        nextDueDate: nextDueDate.trim() || client.nextDueDate,
        installationDate: installationDate.trim() || undefined,
        notes: notes.trim() || undefined,
        hardware: {
          ...client.hardware,
          antennaModel: antennaModel.trim() || 'Ubiquiti LiteBeam 5AC',
          antennaMac: antennaMac.trim().toUpperCase() || 'N/A',
          antennaIp: antennaIp.trim() || '192.168.10.150',
          sectorTower: sectorTower.trim() || 'Tour Boujarah (Relais Centre)',
          signalStrengthDbm: Number(signalStrengthDbm) || -65,
          routerModel: routerModel.trim() || 'Standard Router',
          wifiSsid: wifiSsid.trim() || `${name.trim().split(' ')[0]}_WiFi`,
          wifiPassword: wifiPassword.trim() || '12345678',
          pppoeUsername: pppoeUsername.trim() || `user_${client.id.slice(0, 6)}`,
          pppoePassword: pppoePassword.trim() || '123456',
        },
      };

      await updateClient(client.id, updatedPayload);

      if (onSuccess) {
        onSuccess(`Les informations de l'abonné "${name.trim()}" ont été mises à jour avec succès.`);
      }

      onClose();
    } catch (err) {
      console.error('[EditClientModal] Update failed:', err);
      setIsSubmitting(false);
    }
  };

  const getSignalBadge = (dbm: number) => {
    if (dbm >= -62) {
      return { text: 'Signal Excellent (-62 dBm ou mieux)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
    if (dbm >= -70) {
      return { text: 'Signal Bon (-63 à -70 dBm)', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    }
    if (dbm >= -78) {
      return { text: 'Signal Moyen (-71 à -78 dBm)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    }
    return { text: 'Signal Faible (<-78 dBm)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const signalBadge = getSignalBadge(signalStrengthDbm);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-client-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="edit-client-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <span>Modifier les informations de l&apos;abonné</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{client.name}</span>
                <span>•</span>
                <span className="font-mono text-[11px] text-orange-600 dark:text-orange-400 font-bold">{client.phone}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition flex items-center justify-center cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-4 pt-2 gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border-t border-x cursor-pointer ${
              activeTab === 'info'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 border-slate-200 dark:border-slate-700 border-b-transparent shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>1. Identité & Adresse</span>
            {!isPhoneValid && isPhoneFilled && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border-t border-x cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-[#191522] text-amber-400 border-[#2D253B] border-b-transparent shadow-sm'
                : 'text-[#958B9F] hover:text-[#F4F0F8] border-transparent hover:bg-[#201A2B]/40'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>2. Tarif & Abonnement</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border-t border-x cursor-pointer ${
              activeTab === 'hardware'
                ? 'bg-[#191522] text-amber-400 border-[#2D253B] border-b-transparent shadow-sm'
                : 'text-[#958B9F] hover:text-[#F4F0F8] border-transparent hover:bg-[#201A2B]/40'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>3. Matériel & Réseau</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* TAB 1: IDENTITÉ & CONTACT & LOCALISATION */}
            {activeTab === 'info' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1.5">
                    Nom complet de l&apos;abonné <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Youness El Mansouri"
                    className="w-full bg-[#130F1A] border border-[#2D253B] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition"
                  />
                  {!isNameFilled && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Le nom de l&apos;abonné est obligatoire.
                    </p>
                  )}
                </div>

                {/* Phone Number with Moroccan Validation */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1.5">
                    Numéro de téléphone portable (Maroc) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06XXXXXXXX / 07XXXXXXXX / +212..."
                      className={`w-full bg-[#130F1A] border rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none transition ${
                        isPhoneFilled
                          ? isPhoneValid
                            ? 'border-emerald-500/70 focus:border-emerald-500'
                            : 'border-rose-500/70 focus:border-rose-500'
                          : 'border-[#2D253B] focus:border-amber-500'
                      }`}
                    />
                    {isPhoneFilled && (
                      <div className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5">
                        {isPhoneValid ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Real-time Phone Feedback */}
                  {isPhoneFilled ? (
                    isPhoneValid ? (
                      <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Format marocain valide (06/07/+212)
                      </p>
                    ) : (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Format invalide : Veuillez saisir un numéro marocain valide (ex: 0612345678, 0712345678 ou +212612345678).
                      </p>
                    )
                  ) : (
                    <p className="text-[10px] text-[#958B9F] mt-1">
                      Formats supportés : 06XXXXXXXX, 07XXXXXXXX ou +212XXXXXXXX
                    </p>
                  )}
                </div>

                {/* Neighborhood & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider">
                        Quartier (Tétouan)
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomNeighborhood(!isCustomNeighborhood)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                      >
                        {isCustomNeighborhood ? 'Choisir dans la liste' : 'Autre quartier'}
                      </button>
                    </div>

                    {isCustomNeighborhood ? (
                      <input
                        type="text"
                        value={customNeighborhood}
                        onChange={(e) => setCustomNeighborhood(e.target.value)}
                        placeholder="Saisir un autre quartier..."
                        className="w-full bg-[#130F1A] border border-[#2D253B] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition"
                      />
                    ) : (
                      <select
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full bg-[#130F1A] border border-[#2D253B] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F0F8] focus:outline-none focus:border-amber-500 transition"
                      >
                        {TETOUAN_NEIGHBORHOODS.map((q) => (
                          <option key={q} value={q}>
                            📍 {q}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1.5">
                      Adresse détaillée / Immeuble
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="ex: Rue 14, Imm B, Apt 3"
                      className="w-full bg-[#130F1A] border border-[#2D253B] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                {/* GPS & Google Maps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1.5">
                      Lien Google Maps
                    </label>
                    <input
                      type="url"
                      value={googleMapsUrl}
                      onChange={(e) => setGoogleMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full bg-[#130F1A] border border-[#2D253B] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1.5">
                      Coordonnées GPS (Lat, Long)
                    </label>
                    <input
                      type="text"
                      value={gpsCoordinates}
                      onChange={(e) => setGpsCoordinates(e.target.value)}
                      placeholder="ex: 35.5784,-5.3684"
                      className="w-full bg-[#130F1A] border border-[#2D253B] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TARIF & FORFAIT & FACTURATION */}
            {activeTab === 'billing' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Monthly fee & Presets */}
                <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider">
                      Tarif mensuel de l&apos;abonnement (MAD / DH) <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {monthlyFee} DH / mois
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="10"
                        max="2000"
                        required
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(Number(e.target.value) || 0)}
                        className="w-full bg-[#0F0C14] border border-[#2D253B] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#F4F0F8] focus:outline-none focus:border-amber-500 transition"
                      />
                      <span className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-xs text-[#958B9F] font-bold">
                        MAD
                      </span>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#958B9F] mr-1">Raccourcis :</span>
                    {[50, 100, 150, 200, 300].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setMonthlyFee(preset);
                          if (preset === 50) setSubscriptionPlan('باقة اقتصادية - 50 د.م./شهر (Pack Éco 50 MAD)');
                          else if (preset === 100) setSubscriptionPlan('باقة قياسية - 100 د.م./شهر (Pack Standard 100 MAD)');
                          else if (preset === 150) setSubscriptionPlan('باقة متقدمة - 150 د.م./شهر (Pack Avancé 150 MAD)');
                          else if (preset >= 200) setSubscriptionPlan(`باقة احترافية - ${preset} د.م./شهر (Pack Pro ${preset} MAD)`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer border ${
                          monthlyFee === preset
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                            : 'bg-[#191522] text-[#958B9F] border-[#2D253B] hover:text-[#F4F0F8] hover:bg-[#241E30]'
                        }`}
                      >
                        {preset} DH
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subscription Plan Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1.5">
                    Nom du forfait d&apos;abonnement
                  </label>
                  <input
                    type="text"
                    value={subscriptionPlan}
                    onChange={(e) => setSubscriptionPlan(e.target.value)}
                    placeholder="ex: Pack Standard 100 MAD"
                    className="w-full bg-[#130F1A] border border-[#2D253B] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Status & Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1.5">
                      Statut du compte
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                      className="w-full bg-[#130F1A] border border-[#2D253B] rounded-xl px-3 py-2.5 text-xs text-[#F4F0F8] focus:outline-none focus:border-amber-500 transition"
                    >
                      <option value="active">🟢 Actif (Payé)</option>
                      <option value="due_soon">🟡 Échéance Proche</option>
                      <option value="overdue">🔴 En Retard</option>
                      <option value="suspended">⛔ Suspendu</option>
                      <option value="archived">📦 Archivé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1.5">
                      Date d&apos;échéance (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                      className="w-full bg-[#130F1A] border border-[#2D253B] rounded-xl px-3 py-2.5 text-xs font-mono text-[#F4F0F8] focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1.5">
                      Date d&apos;installation
                    </label>
                    <input
                      type="date"
                      value={installationDate}
                      onChange={(e) => setInstallationDate(e.target.value)}
                      className="w-full bg-[#130F1A] border border-[#2D253B] rounded-xl px-3 py-2.5 text-xs font-mono text-[#F4F0F8] focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1.5">
                    Notes et observations du technicien
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Remarques sur le câblage, contact d'urgence, arrangements spéciaux..."
                    className="w-full bg-[#130F1A] border border-[#2D253B] rounded-xl p-3 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: MATÉRIEL & CONFIGURATION RÉSEAU */}
            {activeTab === 'hardware' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* CPE Antenna Section */}
                <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Radio className="w-4 h-4" />
                    <span>Antenne Récepteur CPE (Toiture)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1">
                        Modèle de l&apos;antenne
                      </label>
                      <select
                        value={antennaModel}
                        onChange={(e) => setAntennaModel(e.target.value)}
                        className="w-full bg-[#0F0C14] border border-[#2D253B] rounded-xl px-3 py-2 text-xs text-[#F4F0F8] focus:outline-none focus:border-amber-500 transition"
                      >
                        {ANTENNA_MODELS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1">
                        Adresse MAC Antenne
                      </label>
                      <input
                        type="text"
                        value={antennaMac}
                        onChange={(e) => setAntennaMac(e.target.value.toUpperCase())}
                        placeholder="DC:9F:DB:XX:XX:XX"
                        className="w-full bg-[#0F0C14] border border-[#2D253B] rounded-xl px-3 py-2 text-xs font-mono text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1">
                        Adresse IP Antenne
                      </label>
                      <input
                        type="text"
                        value={antennaIp}
                        onChange={(e) => setAntennaIp(e.target.value)}
                        placeholder="192.168.10.150"
                        className="w-full bg-[#0F0C14] border border-[#2D253B] rounded-xl px-3 py-2 text-xs font-mono text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1">
                        Pylône Relais / Secteur
                      </label>
                      <select
                        value={sectorTower}
                        onChange={(e) => setSectorTower(e.target.value)}
                        className="w-full bg-[#0F0C14] border border-[#2D253B] rounded-xl px-3 py-2 text-xs text-[#F4F0F8] focus:outline-none focus:border-amber-500 transition"
                      >
                        {SECTOR_TOWERS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Signal Strength Meter */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-semibold text-[#958B9F] uppercase tracking-wider">
                        Puissance du signal radio (dBm)
                      </label>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${signalBadge.color}`}>
                        {signalStrengthDbm} dBm • {signalBadge.text}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-90"
                      max="-45"
                      value={signalStrengthDbm}
                      onChange={(e) => setSignalStrengthDbm(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Router Section */}
                <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                    <Wifi className="w-4 h-4" />
                    <span>Routeur & Paramètres Wi-Fi</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1">
                        Modèle de routeur
                      </label>
                      <select
                        value={routerModel}
                        onChange={(e) => setRouterModel(e.target.value)}
                        className="w-full bg-[#0F0C14] border border-[#2D253B] rounded-xl px-3 py-2 text-xs text-[#F4F0F8] focus:outline-none focus:border-amber-500 transition"
                      >
                        {ROUTER_MODELS.map((rm) => (
                          <option key={rm} value={rm}>
                            {rm}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1">
                        Nom du Wi-Fi (SSID)
                      </label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="ex: YounessNet_Salon"
                        className="w-full bg-[#0F0C14] border border-[#2D253B] rounded-xl px-3 py-2 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1">
                        Mot de passe Wi-Fi
                      </label>
                      <div className="relative">
                        <input
                          type={showWifiPassword ? 'text' : 'password'}
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder="Mot de passe WPA2"
                          className="w-full bg-[#0F0C14] border border-[#2D253B] rounded-xl px-3 py-2 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition font-mono pr-8 rtl:pr-3 rtl:pl-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowWifiPassword(!showWifiPassword)}
                          className="absolute right-2 rtl:right-auto rtl:left-2 top-2 text-[#958B9F] hover:text-[#F4F0F8] cursor-pointer"
                        >
                          {showWifiPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PPPoE Authentication */}
                <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Server className="w-4 h-4" />
                    <span>Compte & Authentification PPPoE</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1">
                        Identifiant PPPoE (Username)
                      </label>
                      <input
                        type="text"
                        value={pppoeUsername}
                        onChange={(e) => setPppoeUsername(e.target.value)}
                        placeholder="user_client_101"
                        className="w-full bg-[#0F0C14] border border-[#2D253B] rounded-xl px-3 py-2 text-xs text-amber-300 placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#958B9F] uppercase tracking-wider mb-1">
                        Mot de passe PPPoE
                      </label>
                      <div className="relative">
                        <input
                          type={showPppoePassword ? 'text' : 'password'}
                          value={pppoePassword}
                          onChange={(e) => setPppoePassword(e.target.value)}
                          placeholder="Secret PPPoE"
                          className="w-full bg-[#0F0C14] border border-[#2D253B] rounded-xl px-3 py-2 text-xs text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition font-mono pr-8 rtl:pr-3 rtl:pl-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPppoePassword(!showPppoePassword)}
                          className="absolute right-2 rtl:right-auto rtl:left-2 top-2 text-[#958B9F] hover:text-[#F4F0F8] cursor-pointer"
                        >
                          {showPppoePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {!isPhoneValid && isPhoneFilled && (
                <span className="text-rose-500 font-medium">⚠️ Corrigez le numéro de téléphone</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>Enregistrer les modifications</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
