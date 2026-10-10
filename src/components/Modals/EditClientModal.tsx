'use client';

import Dialog from '@/components/ui/Dialog';

import React, { useState } from 'react';
import { useStore, isValidMoroccanPhone } from '@/lib/store';
import { Client, SubscriptionStatus } from '@/lib/types';
import { X, UserCheck, Radio, Wifi, MapPin, CreditCard, CheckCircle, AlertCircle, Eye, EyeOff, Server, Save, Loader2 } from 'lucide-react';
import { TETOUAN_NEIGHBORHOODS, ANTENNA_MODELS, ROUTER_MODELS, SECTOR_TOWERS } from './RegisterClientModal';

interface Props {
  client: Client;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export default function EditClientModal({ client, onClose, onSuccess }: Props) {
  const { updateClient, language } = useStore();
  const text = (fr: string, en: string, ar: string) => language === 'ar' ? ar : language === 'en' ? en : fr;

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
      return { text: text("Signal Excellent (-62 dBm ou mieux)", "Excellent signal (-62 dBm or better)", "إشارة ممتازة (-62 dBm أو أفضل)"), color: 'text-[var(--success)] bg-emerald-500/10 border-emerald-500/30' };
    }
    if (dbm >= -70) {
      return { text: text("Signal Bon (-63 à -70 dBm)", "Good signal (-63 to -70 dBm)", "إشارة جيدة (-63 إلى -70 dBm)"), color: 'text-[var(--info)] bg-blue-500/10 border-blue-500/30' };
    }
    if (dbm >= -78) {
      return { text: text("Signal Moyen (-71 à -78 dBm)", "Fair signal (-71 to -78 dBm)", "إشارة متوسطة (-71 إلى -78 dBm)"), color: 'text-[var(--warning)] bg-amber-500/10 border-amber-500/30' };
    }
    return { text: text("Signal Faible (<-78 dBm)", "Weak signal (<-78 dBm)", "إشارة ضعيفة (<-78 dBm)"), color: 'text-[var(--error)] bg-rose-500/10 border-rose-500/30' };
  };

  const signalBadge = getSignalBadge(signalStrengthDbm);

  return (
    <Dialog onClose={onClose} label={text("Modifier un abonné", "Edit subscriber", "تعديل المشترك")}>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] bg-white/95 dark:bg-slate-900/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-[var(--primary)] dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="edit-client-modal-title"
                className="text-base sm:text-lg font-bold text-[var(--text)] flex items-center gap-2"
              >
                <span>{text("Modifier les informations de l'abonné", "Edit subscriber details", "تعديل معلومات المشترك")}</span>
              </h2>
              <p className="text-sm text-[var(--muted)] flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-[var(--text-secondary)]">{client.name}</span>
                <span>•</span>
                <span className="font-mono text-[12px] text-[var(--primary)] dark:text-orange-400 font-bold">{client.phone}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[var(--muted)] hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition flex items-center justify-center cursor-pointer"
            aria-label={text("Fermer", "Close", "إغلاق")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border)] bg-slate-50 dark:bg-slate-800/40 px-4 pt-2 gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            aria-pressed={activeTab === 'info'} onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition flex items-center gap-2 shrink-0 border-t border-x cursor-pointer ${
              activeTab === 'info'
                ? 'bg-[var(--surface)] text-[var(--primary)] dark:text-orange-400 border-slate-200 dark:border-slate-700 border-b-transparent shadow-xs'
                : 'text-[var(--muted)] hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{text("1. Identité & Adresse", "1. Identity & address", "1. الهوية والعنوان")}</span>
            {!isPhoneValid && isPhoneFilled && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            type="button"
            aria-pressed={activeTab === 'billing'} onClick={() => setActiveTab('billing')}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition flex items-center gap-2 shrink-0 border-t border-x cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-[var(--surface)] text-[var(--warning)] border-[var(--border)] border-b-transparent shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--text)] border-transparent hover:bg-[var(--surface-hover)]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{text("2. Tarif & Abonnement", "2. Pricing & subscription", "2. التعرفة والاشتراك")}</span>
          </button>

          <button
            type="button"
            aria-pressed={activeTab === 'hardware'} onClick={() => setActiveTab('hardware')}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition flex items-center gap-2 shrink-0 border-t border-x cursor-pointer ${
              activeTab === 'hardware'
                ? 'bg-[var(--surface)] text-[var(--warning)] border-[var(--border)] border-b-transparent shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--text)] border-transparent hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{text("3. Matériel & Réseau", "3. Hardware & network", "3. المعدات والشبكة")}</span>
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
                  <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5" htmlFor="EditClientModal-field-0">
                    {text("Nom complet de l'abonné", "Subscriber full name", "الاسم الكامل للمشترك")} <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Youness El Mansouri"
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition"
                    id="EditClientModal-field-0"/>
                  {!isNameFilled && (
                    <p className="text-[12px] text-[var(--error)] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {text("Le nom de l'abonné est obligatoire.", "Subscriber name is required.", "اسم المشترك مطلوب.")}
                    </p>
                  )}
                </div>

                {/* Phone Number with Moroccan Validation */}
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5" htmlFor="EditClientModal-field-1">
                    {text("Numéro de téléphone portable (Maroc)", "Mobile phone number (Morocco)", "رقم الهاتف المحمول (المغرب)")} <span className="text-[var(--error)]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06XXXXXXXX / 07XXXXXXXX / +212..."
                      className={`w-full bg-[var(--surface-muted)] border rounded-xl px-3.5 py-2.5 text-sm font-mono text-[var(--text)] placeholder-[var(--muted)] focus:outline-none transition ${
                        isPhoneFilled
                          ? isPhoneValid
                            ? 'border-emerald-500/70 focus:border-emerald-500'
                            : 'border-rose-500/70 focus:border-rose-500'
                          : 'border-[var(--border)] focus:border-amber-500'
                      }`}
                      id="EditClientModal-field-1"/>
                    {isPhoneFilled && (
                      <div className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5">
                        {isPhoneValid ? (
                          <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-[var(--error)]" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Real-time Phone Feedback */}
                  {isPhoneFilled ? (
                    isPhoneValid ? (
                      <p className="text-[12px] text-[var(--success)] mt-1 flex items-center gap-1 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        {text("Format marocain valide (06/07/+212)", "Valid Moroccan format (06/07/+212)", "صيغة مغربية صحيحة (06/07/+212)")}
                      </p>
                    ) : (
                      <p className="text-[12px] text-[var(--error)] mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        {text("Format invalide : Veuillez saisir un numéro marocain valide (ex: 0612345678, 0712345678 ou +212612345678).", "Enter a valid Moroccan number (e.g. 0612345678, 0712345678 or +212612345678).", "أدخل رقماً مغربياً صحيحاً (مثال: 0612345678 أو 0712345678 أو +212612345678).")}
                      </p>
                    )
                  ) : (
                    <p className="text-[12px] text-[var(--muted)] mt-1">
                      {text("Formats supportés : 06XXXXXXXX, 07XXXXXXXX ou +212XXXXXXXX", "Supported formats: 06XXXXXXXX, 07XXXXXXXX or +212XXXXXXXX", "الصيغ المدعومة: 06XXXXXXXX أو 07XXXXXXXX أو +212XXXXXXXX")}
                    </p>
                  )}
                </div>

                {/* Neighborhood & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider" htmlFor="EditClientModal-field-2">
                        {text("Quartier (Tétouan)", "Neighborhood (Tétouan)", "الحي (تطوان)")}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomNeighborhood(!isCustomNeighborhood)}
                        className="text-[12px] text-[var(--warning)] hover:text-[var(--primary)] underline cursor-pointer"
                      >
                        {isCustomNeighborhood ? text('Choisir dans la liste', 'Choose from list', 'اختر من القائمة') : text('Autre quartier', 'Other neighborhood', 'حي آخر')}
                      </button>
                    </div>

                    {isCustomNeighborhood ? (
                      <input
                        type="text"
                        value={customNeighborhood}
                        onChange={(e) => setCustomNeighborhood(e.target.value)}
                        placeholder={text("Saisir un autre quartier...", "Enter another neighborhood...", "أدخل حياً آخر...")}
                        className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition"
                        id="EditClientModal-field-2"/>
                    ) : (
                      <select
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-amber-500 transition"
                       aria-label={text("Quartier", "Neighborhood", "الحي")}>
                        {TETOUAN_NEIGHBORHOODS.map((q) => (
                          <option key={q} value={q}>
                            📍 {q}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5" htmlFor="EditClientModal-field-3">
                      {text("Adresse détaillée / Immeuble", "Full address / building", "العنوان الكامل / العمارة")}
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="ex: Rue 14, Imm B, Apt 3"
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition"
                      id="EditClientModal-field-3"/>
                  </div>
                </div>

                {/* GPS & Google Maps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5" htmlFor="EditClientModal-field-4">
                      {text("Lien Google Maps", "Google Maps link", "رابط خرائط Google")}
                    </label>
                    <input
                      type="url"
                      value={googleMapsUrl}
                      onChange={(e) => setGoogleMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition font-mono"
                      id="EditClientModal-field-4"/>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5" htmlFor="EditClientModal-field-5">
                      {text("Coordonnées GPS (Lat, Long)", "GPS coordinates (lat, long)", "إحداثيات GPS (خط العرض، خط الطول)")}
                    </label>
                    <input
                      type="text"
                      value={gpsCoordinates}
                      onChange={(e) => setGpsCoordinates(e.target.value)}
                      placeholder="ex: 35.5784,-5.3684"
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition font-mono"
                      id="EditClientModal-field-5"/>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TARIF & FORFAIT & FACTURATION */}
            {activeTab === 'billing' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Monthly fee & Presets */}
                <div className="p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider" htmlFor="EditClientModal-field-6">
                      {text("Tarif mensuel de l'abonnement (MAD / DH)", "Monthly subscription fee (MAD / DH)", "تعرفة الاشتراك الشهرية (MAD / DH)")} <span className="text-[var(--error)]">*</span>
                    </label>
                    <span className="text-sm font-mono font-bold text-[var(--warning)]">
                      {monthlyFee} {text("DH / mois", "DH / month", "DH / شهر")}
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
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[var(--text)] focus:outline-none focus:border-amber-500 transition"
                        id="EditClientModal-field-6"/>
                      <span className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-sm text-[var(--muted)] font-bold">
                        MAD
                      </span>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[12px] text-[var(--muted)] mr-1">{text("Raccourcis :", "Presets:", "تعرفات سريعة:")}</span>
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
                        className={`px-2.5 py-1 rounded-lg text-[12px] font-mono font-bold transition cursor-pointer border ${
                          monthlyFee === preset
                            ? 'bg-amber-500/20 text-[var(--warning)] border-amber-500/50 shadow-sm'
                            : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)]'
                        }`}
                      >
                        {preset} DH
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subscription Plan Name */}
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5" htmlFor="EditClientModal-field-7">
                    {text("Nom du forfait d'abonnement", "Subscription plan name", "اسم باقة الاشتراك")}
                  </label>
                  <input
                    type="text"
                    value={subscriptionPlan}
                    onChange={(e) => setSubscriptionPlan(e.target.value)}
                    placeholder="ex: Pack Standard 100 MAD"
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition"
                    id="EditClientModal-field-7"/>
                </div>

                {/* Status & Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5" htmlFor="EditClientModal-field-8">
                      {text("Statut du compte", "Account status", "حالة الحساب")}
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-amber-500 transition"
                      id="EditClientModal-field-8">
                      <option value="active">{text("🟢 Actif (Payé)", "🟢 Active (paid)", "🟢 نشط (مؤدى)")}</option>
                      <option value="due_soon">{text("🟡 Échéance Proche", "🟡 Due soon", "🟡 اقترب موعد الأداء")}</option>
                      <option value="overdue">{text("🔴 En Retard", "🔴 Overdue", "🔴 متأخر عن الأداء")}</option>
                      <option value="suspended">{text("⛔ Suspendu", "⛔ Suspended", "⛔ معلق")}</option>
                      <option value="archived">{text("📦 Archivé", "📦 Archived", "📦 مؤرشف")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5" htmlFor="EditClientModal-field-9">
                      {text("Date d'échéance (YYYY-MM-DD)", "Due date (YYYY-MM-DD)", "تاريخ الاستحقاق (YYYY-MM-DD)")}
                    </label>
                    <input
                      type="date"
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm font-mono text-[var(--text)] focus:outline-none focus:border-amber-500 transition"
                      id="EditClientModal-field-9"/>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5" htmlFor="EditClientModal-field-10">
                      {text("Date d'installation", "Installation date", "تاريخ التركيب")}
                    </label>
                    <input
                      type="date"
                      value={installationDate}
                      onChange={(e) => setInstallationDate(e.target.value)}
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm font-mono text-[var(--text)] focus:outline-none focus:border-amber-500 transition"
                      id="EditClientModal-field-10"/>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5" htmlFor="EditClientModal-field-11">
                    {text("Notes et observations du technicien", "Technician notes", "ملاحظات التقني")}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={text("Remarques sur le câblage, contact d'urgence, arrangements spéciaux...", "Cabling notes, emergency contact, special arrangements...", "ملاحظات الأسلاك، جهة اتصال للطوارئ، ترتيبات خاصة...")}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition resize-none"
                    id="EditClientModal-field-11"/>
                </div>
              </div>
            )}

            {/* TAB 3: MATÉRIEL & CONFIGURATION RÉSEAU */}
            {activeTab === 'hardware' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* CPE Antenna Section */}
                <div className="p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--warning)]">
                    <Radio className="w-4 h-4" />
                    <span>{text("Antenne Récepteur CPE (Toiture)", "CPE receiver antenna (rooftop)", "هوائي استقبال CPE (السطح)")}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1" htmlFor="EditClientModal-field-12">
                        {text("Modèle de l'antenne", "Antenna model", "طراز الهوائي")}
                      </label>
                      <select
                        value={antennaModel}
                        onChange={(e) => setAntennaModel(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-amber-500 transition"
                        id="EditClientModal-field-12">
                        {ANTENNA_MODELS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1" htmlFor="EditClientModal-field-13">
                        {text("Adresse MAC Antenne", "Antenna MAC address", "عنوان MAC للهوائي")}
                      </label>
                      <input
                        type="text"
                        value={antennaMac}
                        onChange={(e) => setAntennaMac(e.target.value.toUpperCase())}
                        placeholder="DC:9F:DB:XX:XX:XX"
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm font-mono text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition"
                        id="EditClientModal-field-13"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1" htmlFor="EditClientModal-field-14">
                        {text("Adresse IP Antenne", "Antenna IP address", "عنوان IP للهوائي")}
                      </label>
                      <input
                        type="text"
                        value={antennaIp}
                        onChange={(e) => setAntennaIp(e.target.value)}
                        placeholder="192.168.10.150"
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm font-mono text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition"
                        id="EditClientModal-field-14"/>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1" htmlFor="EditClientModal-field-15">
                        {text("Pylône Relais / Secteur", "Relay tower / sector", "برج الإرسال / القطاع")}
                      </label>
                      <select
                        value={sectorTower}
                        onChange={(e) => setSectorTower(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-amber-500 transition"
                        id="EditClientModal-field-15">
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
                      <label className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider" htmlFor="EditClientModal-field-16">
                        {text("Puissance du signal radio (dBm)", "Radio signal strength (dBm)", "قوة الإشارة اللاسلكية (dBm)")}
                      </label>
                      <span className={`text-[12px] font-mono font-bold px-2 py-0.5 rounded border ${signalBadge.color}`}>
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
                      id="EditClientModal-field-16"/>
                  </div>
                </div>

                {/* Router Section */}
                <div className="p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--info)]">
                    <Wifi className="w-4 h-4" />
                    <span>{text("Routeur & Paramètres Wi-Fi", "Router & Wi-Fi settings", "الموجه وإعدادات Wi-Fi")}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1" htmlFor="EditClientModal-field-17">
                        {text("Modèle de routeur", "Router model", "طراز الموجه")}
                      </label>
                      <select
                        value={routerModel}
                        onChange={(e) => setRouterModel(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-amber-500 transition"
                        id="EditClientModal-field-17">
                        {ROUTER_MODELS.map((rm) => (
                          <option key={rm} value={rm}>
                            {rm}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1" htmlFor="EditClientModal-field-18">
                        {text("Nom du Wi-Fi (SSID)", "Wi-Fi name (SSID)", "اسم Wi-Fi (SSID)")}
                      </label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="ex: YounessNet_Salon"
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition font-mono"
                        id="EditClientModal-field-18"/>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1" htmlFor="EditClientModal-field-19">
                        {text("Mot de passe Wi-Fi", "Wi-Fi password", "كلمة مرور Wi-Fi")}
                      </label>
                      <div className="relative">
                        <input
                          type={showWifiPassword ? 'text' : 'password'}
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                          placeholder={text("Mot de passe WPA2", "WPA2 password", "كلمة مرور WPA2")}
                          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition font-mono pr-8 rtl:pr-3 rtl:pl-8"
                          id="EditClientModal-field-19"/>
                        <button
                          type="button"
                          onClick={() => setShowWifiPassword(!showWifiPassword)}
                          className="absolute right-2 rtl:right-auto rtl:left-2 top-2 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                         aria-label={text("Afficher ou masquer le mot de passe", "Show or hide password", "إظهار أو إخفاء كلمة المرور")}>
                          {showWifiPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PPPoE Authentication */}
                <div className="p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--success)]">
                    <Server className="w-4 h-4" />
                    <span>{text("Compte & Authentification PPPoE", "PPPoE account & authentication", "حساب ومصادقة PPPoE")}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1" htmlFor="EditClientModal-field-20">
                        {text("Identifiant PPPoE (Username)", "PPPoE username", "اسم المستخدم PPPoE")}
                      </label>
                      <input
                        type="text"
                        value={pppoeUsername}
                        onChange={(e) => setPppoeUsername(e.target.value)}
                        placeholder="user_client_101"
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--warning)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition font-mono font-bold"
                        id="EditClientModal-field-20"/>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1" htmlFor="EditClientModal-field-21">
                        {text("Mot de passe PPPoE", "PPPoE password", "كلمة مرور PPPoE")}
                      </label>
                      <div className="relative">
                        <input
                          type={showPppoePassword ? 'text' : 'password'}
                          value={pppoePassword}
                          onChange={(e) => setPppoePassword(e.target.value)}
                          placeholder={text("Secret PPPoE", "PPPoE secret", "كلمة مرور PPPoE")}
                          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition font-mono pr-8 rtl:pr-3 rtl:pl-8"
                          id="EditClientModal-field-21"/>
                        <button
                          type="button"
                          onClick={() => setShowPppoePassword(!showPppoePassword)}
                          className="absolute right-2 rtl:right-auto rtl:left-2 top-2 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                         aria-label={text("Afficher ou masquer le mot de passe", "Show or hide password", "إظهار أو إخفاء كلمة المرور")}>
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
          <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-white/95 dark:bg-slate-900/95 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-[12px] text-[var(--muted)]">
              {!isPhoneValid && isPhoneFilled && (
                <span className="text-rose-500 font-medium">{text("⚠️ Corrigez le numéro de téléphone", "⚠️ Correct the phone number", "⚠️ صحح رقم الهاتف")}</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-[var(--surface)] hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center"
              >
                {text("Annuler", "Cancel", "إلغاء")}
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{text("Enregistrement...", "Saving...", "جارٍ الحفظ...")}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>{text("Enregistrer les modifications", "Save changes", "حفظ التعديلات")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
