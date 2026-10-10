'use client';

import Dialog from '@/components/ui/Dialog';

import React, { useState } from 'react';
import { useStore, getTodayDateStr, addMonthsToDateStr, isValidMoroccanPhone } from '@/lib/store';
import { X, UserPlus, Radio, MapPin, CreditCard, CheckCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export const TETOUAN_NEIGHBORHOODS = [
  'Boujarah',
  'Wilaya',
  'Sania Rmel',
  'Touabel',
  'Coelma',
  'Mhannech I',
  'Mhannech II',
  'Medina Kdima',
  'Safir',
  'Dersa',
  'Martil',
  'Cabo Negro',
  'Kitat',
  'Koran',
  'Azla',
  'Amsa',
  'Centre Ville',
  'Ghorfet Ettijara',
  'Ain Khabbaz',
  'El Oulya',
];

export const ANTENNA_MODELS = [
  'Ubiquiti LiteBeam 5AC',
  'Ubiquiti LiteBeam 5AC Gen2',
  'Ubiquiti NanoStation 5AC Loco',
  'Ubiquiti PowerBeam 5AC ISO',
  'MikroTik SXTsq 5 ac',
  'MikroTik DISC Lite5',
  'Ubiquiti airFiber 60 LR',
];

export const ROUTER_MODELS = [
  'Standard Router',
  'TP-Link Archer C6 AC1200',
  'TP-Link Archer C54',
  'Tenda AC10 Gigabit Dual-Band',
  'Tenda TX3 AX1800 Wi-Fi 6',
  'Xiaomi Router 4A Gigabit',
  'Xiaomi Router AX3000 Wi-Fi 6',
  'MikroTik hEX S + UniFi U6-Lite',
];

export const SECTOR_TOWERS = [
  'Tour Boujarah (Relais Centre)',
  'Relais Jbel Dersa (Tétouan Nord)',
  'Pylône Wilaya / Sania Rmel',
  'Station Martil / Cabo Negro',
  'Relais Coelma / Touabel',
];

export default function RegisterClientModal({ onClose, onSuccess }: Props) {
  const { addClient, language } = useStore();
  const text = (fr: string, en: string, ar: string) => language === 'ar' ? ar : language === 'en' ? en : fr;

  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'hardware' | 'billing'>('info');

  // Client Info (Only Name and Phone are mandatory)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('Wilaya');
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Hardware Details (All optional with safe fallbacks)
  const [antennaModel, setAntennaModel] = useState('Ubiquiti LiteBeam 5AC');
  const [antennaMac, setAntennaMac] = useState('');
  const [antennaIp] = useState('192.168.10.');
  const [routerModel, setRouterModel] = useState('Standard Router');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword] = useState('');
  const [pppoeUsername, setPppoeUsername] = useState('');
  const [pppoePassword, setPppoePassword] = useState('123456');
  const [sectorTower, setSectorTower] = useState('Tour Boujarah (Relais Centre)');
  const [signalStrengthDbm, setSignalStrengthDbm] = useState<number>(-65);

  // Subscription Setup
  const [monthlyFee, setMonthlyFee] = useState<number>(50);
  const [subscriptionPlan, setSubscriptionPlan] = useState('باقة اقتصادية - 50 د.م./شهر (Pack Éco 50 MAD)');
  const [installationDate, setInstallationDate] = useState(getTodayDateStr());
  const [nextDueDate, setNextDueDate] = useState(addMonthsToDateStr(getTodayDateStr(), 1));
  const [initialPayment, setInitialPayment] = useState(true);
  const [notes, setNotes] = useState('');

  // Auto-fill SSID and PPPoE suggestions when name changes (with Arabic name fallback support)
  const handleNameChange = (val: string) => {
    setName(val);
    const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '').replace(/_+/g, '_');
    const fallbackSuffix = Math.floor(100 + Math.random() * 900);
    const autoPppoe = clean ? `user_${clean}` : `client_${fallbackSuffix}`;
    const autoSsid = clean ? `${val.trim().split(' ')[0]}_WiFi` : `WiFi_${fallbackSuffix}`;

    if (!pppoeUsername || pppoeUsername.startsWith('cli_') || pppoeUsername.startsWith('user_') || pppoeUsername.startsWith('client_')) {
      setPppoeUsername(autoPppoe);
    }
    if (!wifiSsid || wifiSsid.endsWith('_WiFi')) {
      setWifiSsid(autoSsid);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim() || !phone.trim()) {
      setFormError(text('Indiquez le nom et le téléphone de l’abonné.', 'Enter the subscriber’s name and phone number.', 'أدخل اسم المشترك ورقم الهاتف.'));
      setActiveTab('info');
      return;
    }

    const trimmedName = name.trim();
    const cleanUserSlug = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '').replace(/_+/g, '_');
    const fallbackId = Math.floor(100 + Math.random() * 900);
    const autoPppoeUser = cleanUserSlug ? `user_${cleanUserSlug}` : `client_${fallbackId}`;
    const autoWifiSsid = cleanUserSlug ? `${trimmedName.split(' ')[0]}_WiFi` : `WiFi_${fallbackId}`;

    addClient({
      name: trimmedName,
      phone: phone.trim(),
      neighborhood: neighborhood.trim() || 'Wilaya',
      address: address.trim() || 'Tétouan',
      googleMapsUrl:
        googleMapsUrl.trim() || 'https://maps.google.com/?q=35.5784,-5.3684',
      monthlyFee: Number(monthlyFee) > 0 ? Number(monthlyFee) : 50,
      subscriptionPlan: subscriptionPlan || 'باقة اقتصادية - 50 د.م./شهر (Pack Éco 50 MAD)',
      installationDate: installationDate || getTodayDateStr(),
      nextDueDate: nextDueDate || addMonthsToDateStr(getTodayDateStr(), 1),
      initialPayment,
      notes: notes.trim() || undefined,
      hardware: {
        antennaModel: antennaModel.trim() || 'Ubiquiti LiteBeam 5AC',
        antennaMac: antennaMac.trim().toUpperCase() || 'N/A',
        antennaIp: antennaIp.trim() || '192.168.10.150',
        routerModel: routerModel.trim() || 'Standard Router',
        wifiSsid: wifiSsid.trim() || autoWifiSsid,
        wifiPassword: wifiPassword.trim() || undefined,
        pppoeUsername: pppoeUsername.trim() || autoPppoeUser,
        pppoePassword: pppoePassword.trim() || '123456',
        signalStrengthDbm: Number(signalStrengthDbm) || -65,
        sectorTower: sectorTower.trim() || 'Tour Boujarah (Relais Centre)',
      },
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Dialog onClose={onClose} label="Register Client">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl bg-[var(--surface)] sm:border sm:border-slate-200/80 dark:sm:border-slate-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--border)] bg-white/95 dark:bg-slate-900/95 shrink-0">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50 text-[var(--primary)] dark:bg-orange-500/10 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 shrink-0">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)] dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text)]">{text("Nouvel abonné","New subscriber","مشترك جديد")}</h3>
              <p className="text-[12px] sm:text-sm text-[var(--muted)]">
                {text("Ajoutez les coordonnées, le matériel et l’abonnement.","Add contact details, equipment, and subscription.","أضف بيانات الاتصال والمعدات والاشتراك.")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--muted)] hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
           aria-label={language === "ar" ? "إغلاق" : language === "en" ? "Close" : "Fermer"}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border)] bg-[var(--surface)] px-2 sm:px-6 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            aria-pressed={activeTab === 'info'} onClick={() => setActiveTab('info')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'info'
                ? 'border-orange-500 text-[var(--primary)] dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20'
                : 'border-transparent text-[var(--muted)] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{text("1. Coordonnées","1. Contact","1. البيانات")}</span>
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'hardware'} onClick={() => setActiveTab('hardware')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'hardware'
                ? 'border-orange-500 text-[var(--primary)] dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20'
                : 'border-transparent text-[var(--muted)] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{text("2. Matériel · facultatif","2. Equipment · optional","2. المعدات · اختياري")}</span>
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'billing'} onClick={() => setActiveTab('billing')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'billing'
                ? 'border-orange-500 text-[var(--primary)] dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20'
                : 'border-transparent text-[var(--muted)] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{text("3. Abonnement","3. Subscription","3. الاشتراك")}</span>
          </button>
        </div>

        {/* Form Body with Sticky Footer */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {formError && <p role="alert" className="form-alert">{formError}</p>}
          {/* TAB 1: CLIENT INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-0">
                    {text("Nom complet","Full name","الاسم الكامل")}<span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Taha Bennani"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-0"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-1">
                    {text("Téléphone","Phone number","رقم الهاتف")}<span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="06XXXXXXXX ou +2126XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] font-mono focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-1"/>
                  {phone.trim().length > 0 && !isValidMoroccanPhone(phone) && (
                    <p className="text-[12px] text-[var(--warning)] mt-1">
                      Format suggéré: 06XXXXXXXX, 07XXXXXXXX ou +2126XXXXXXXX
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-2">
                    {text("Quartier","Neighborhood","الحي")}<span className="ms-1 text-[var(--muted)] font-normal text-[12px]">{text("(facultatif)","(optional)","(اختياري)")}</span>
                  </label>
                  <input
                    type="text"
                    list="tetouan-neighborhoods"
                    placeholder="Ex: Wilaya, Boujarah, Martil..."
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-2"/>
                  <datalist id="tetouan-neighborhoods">
                    {TETOUAN_NEIGHBORHOODS.map((area) => (
                      <option key={area} value={area} />
                    ))}
                  </datalist>
                  <p className="text-[12px] text-[var(--muted)] mt-1">
                    {text("Choisissez un quartier ou saisissez le vôtre.","Choose a neighborhood or enter your own.","اختر حياً أو أدخل اسم الحي.")}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-3">
                    {text("Adresse","Address","العنوان")}<span className="ms-1 text-[var(--muted)] font-normal text-[12px]">{text("(facultatif)","(optional)","(اختياري)")}</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Rue 14, Derb..., Immeuble 3, 2ème étage"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-3"/>
                  <p className="text-[12px] text-[var(--muted)] mt-1">
                    {text("Rue, immeuble, étage…","Street, building, floor…","الشارع، المبنى، الطابق…")}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-4">
                  {text("Lien Google Maps ou coordonnées GPS","Google Maps link or GPS coordinates","رابط خرائط Google أو إحداثيات GPS")}<span className="ms-1 text-[var(--muted)] font-normal text-[12px]">{text("(facultatif)","(optional)","(اختياري)")}</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: https://maps.google.com/?q=35.5784,-5.3684 ou 35.5784, -5.3684"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                  id="RegisterClientModal-field-4"/>
                <p className="text-[12px] text-[var(--muted)] mt-1">
                  {text("Aidez votre technicien à trouver l’adresse.","Help your technician find the address.","ساعد التقني في العثور على العنوان.")}</p>
              </div>
            </div>
          )}

          {/* TAB 2: HARDWARE & RADIO */}
          {activeTab === 'hardware' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-5">
                    {text("Modèle d’antenne / CPE","Antenna / CPE model","طراز الهوائي / CPE")}<span className="ms-1 text-[var(--muted)] font-normal text-[12px]">{text("(facultatif)","(optional)","(اختياري)")}</span>
                  </label>
                  <input
                    type="text"
                    list="antenna-models"
                    value={antennaModel}
                    onChange={(e) => setAntennaModel(e.target.value)}
                    placeholder="Ubiquiti LiteBeam 5AC"
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-5"/>
                  <datalist id="antenna-models">
                    {ANTENNA_MODELS.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-6">
                    {text("Adresse MAC","MAC address","عنوان MAC")}<span className="ms-1 text-[var(--muted)] font-normal text-[12px]">(Optional, defaults to N/A)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: DC:9F:DB:XX:XX:XX (Defaults to N/A)"
                    value={antennaMac}
                    onChange={(e) => setAntennaMac(e.target.value)}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] font-mono uppercase focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-6"/>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-7">
                    {text("Relais de rattachement","Assigned relay","محطة الربط")}<span className="ms-1 text-[var(--muted)] font-normal text-[12px]">{text("(facultatif)","(optional)","(اختياري)")}</span>
                  </label>
                  <input
                    type="text"
                    list="sector-towers"
                    value={sectorTower}
                    onChange={(e) => setSectorTower(e.target.value)}
                    placeholder="Tour Boujarah (Relais Centre)"
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-7"/>
                  <datalist id="sector-towers">
                    {SECTOR_TOWERS.map((st) => (
                      <option key={st} value={st} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-8">
                    {text("Niveau de signal (dBm)","Signal strength (dBm)","قوة الإشارة (dBm)")}<span className="ms-1 text-[var(--muted)] font-normal text-[12px]">(Optional, defaults to -65)</span>
                  </label>
                  <input
                    type="number"
                    max="-30"
                    min="-90"
                    placeholder="-65"
                    value={signalStrengthDbm}
                    onChange={(e) => setSignalStrengthDbm(Number(e.target.value))}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] font-mono focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-8"/>
                  <div className="text-[12px] text-[var(--muted)] mt-1">
                    Optimal: between -55 dBm and -65 dBm (Default: -65 dBm)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-9">
                    {text("Modèle de routeur","Router model","طراز جهاز التوجيه")}<span className="ms-1 text-[var(--muted)] font-normal text-[12px]">{text("(facultatif)","(optional)","(اختياري)")}</span>
                  </label>
                  <input
                    type="text"
                    list="router-models"
                    value={routerModel}
                    onChange={(e) => setRouterModel(e.target.value)}
                    placeholder="Standard Router"
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-9"/>
                  <datalist id="router-models">
                    {ROUTER_MODELS.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-10">
                    {text("Nom du réseau Wi-Fi","Wi-Fi network name","اسم شبكة Wi-Fi")}<span className="ms-1 text-[var(--muted)] font-normal text-[12px]">(Optional, defaults to Name_WiFi)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Client_WiFi (Auto-generated if empty)"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-10"/>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-11">
                    {text("Identifiant PPPoE","PPPoE username","اسم مستخدم PPPoE")}<span className="ms-1 text-[var(--muted)] font-normal text-[12px]">(Optional, auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: user_client (Auto-generated if empty)"
                    value={pppoeUsername}
                    onChange={(e) => setPppoeUsername(e.target.value)}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] font-mono focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-11"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-12">
                    {text("Mot de passe PPPoE","PPPoE password","كلمة مرور PPPoE")}<span className="ms-1 text-[var(--muted)] font-normal text-[12px]">(Optional, defaults to 123456)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={pppoePassword}
                    onChange={(e) => setPppoePassword(e.target.value)}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] font-mono focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-12"/>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-13">
                    {text("Forfait","Subscription plan","الباقة")}</label>
                  <select
                    value={subscriptionPlan}
                    onChange={(e) => {
                      const newPlan = e.target.value;
                      setSubscriptionPlan(newPlan);
                      if (newPlan.includes('50 MAD') || newPlan.includes('50 د.م.')) setMonthlyFee(50);
                      else if (newPlan.includes('100 MAD')) setMonthlyFee(100);
                      else if (newPlan.includes('120 MAD')) setMonthlyFee(120);
                      else if (newPlan.includes('150 MAD')) setMonthlyFee(150);
                      else if (newPlan.includes('200 MAD')) setMonthlyFee(200);
                      else if (newPlan.includes('300 MAD')) setMonthlyFee(300);
                      else if (newPlan.includes('500 MAD')) setMonthlyFee(500);
                    }}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                    id="RegisterClientModal-field-13">
                    <option value="باقة اقتصادية - 50 د.م./شهر (Pack Éco 50 MAD)">باقة اقتصادية - 50 د.م./شهر (Pack Éco 50 MAD)</option>
                    <option value="Standard Wi-Fi Plan (100 MAD)">Standard Wi-Fi Plan (100 MAD)</option>
                    <option value="20 Mbps Fiber-Air Eco (120 MAD)">20 Mbps Fiber-Air Eco (120 MAD)</option>
                    <option value="30 Mbps Fiber-Air Ultra (150 MAD)">30 Mbps Fiber-Air Ultra (150 MAD)</option>
                    <option value="40 Mbps Gaming Plus (200 MAD)">40 Mbps Gaming Plus (200 MAD)</option>
                    <option value="50 Mbps VIP Unlimited (300 MAD)">50 Mbps VIP Unlimited (300 MAD)</option>
                    <option value="100 Mbps Pro Business (500 MAD)">100 Mbps Pro Business (500 MAD)</option>
                    <option value="Custom Agreement Plan">Custom Agreement Plan</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider" htmlFor="RegisterClientModal-field-14">
                      {text("Mensualité (DH)","Monthly fee (MAD)","الاشتراك الشهري (DH)")}</label>
                    <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-[var(--info)] border border-cyan-800">
                      Standard: 100 MAD
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] font-mono font-bold focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-14"/>
                  <p className="text-[12px] text-[var(--muted)] mt-1">
                    {text("Vous pourrez modifier ce tarif plus tard.","You can change this rate later.","يمكنك تعديل التعرفة لاحقاً.")}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-15">
                    {text("Date d’installation","Installation date","تاريخ التركيب")}</label>
                  <input
                    type="date"
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] font-mono focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-15"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-16">
                    {text("Prochaine échéance","Next due date","موعد الأداء المقبل")}</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] font-mono focus:outline-none focus:border-amber-500/50 transition"
                    id="RegisterClientModal-field-16"/>
                </div>
              </div>

              {/* Immediate payment toggle */}
              <div className="p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[var(--text)]">
                    {text("Encaisser le premier mois","Record first month payment","تسجيل دفعة الشهر الأول")}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {text("Un reçu sera généré pour ce paiement.","A receipt will be generated for this payment.","سيتم إنشاء إيصال لهذه الدفعة.")}</div>
                </div>
                <input
                  type="checkbox"
                  checked={initialPayment}
                  onChange={(e) => setInitialPayment(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                 aria-label="input"/>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="RegisterClientModal-field-17">
                  {text("Notes d’installation","Installation notes","ملاحظات التركيب")}</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Câble Cat6 blindé passé par la façade, mât fixé sur cheminée, prise PoE salon..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                  id="RegisterClientModal-field-17"/>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Modal Footer CTA Button Bar */}
        <div className="bg-[var(--surface-muted)]/95 backdrop-blur-md p-4 sm:px-6 sm:py-4 border-t border-[var(--border)] flex items-center justify-between gap-3 z-10 shrink-0">
          {activeTab === 'info' && (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                {text("Annuler","Cancel","إلغاء")}</button>
              <button
                type="button"
                onClick={() => { if (name.trim() && phone.trim()) { setFormError(null); setActiveTab('billing'); } else setFormError(text('Indiquez le nom et le téléphone de l’abonné.', 'Enter the subscriber’s name and phone number.', 'أدخل اسم المشترك ورقم الهاتف.')); }}
                className="min-h-[46px] py-2.5 px-5 text-sm sm:text-sm font-semibold bg-[var(--surface)] hover:bg-slate-50 dark:hover:bg-slate-700 border border-[var(--border)] text-slate-800 dark:text-slate-200 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs hover:shadow"
              >
                <span>{text("Continuer vers la facturation","Continue to billing","المتابعة إلى الفوترة")}</span>
              </button>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className="px-4 py-2.5 text-sm sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                {text("Retour","Back","رجوع")}</button>
              <button
                type="button"
                onClick={() => setActiveTab('billing')}
                className="min-h-[46px] py-2.5 px-5 text-sm sm:text-sm font-semibold bg-[var(--surface)] hover:bg-slate-50 dark:hover:bg-slate-700 border border-[var(--border)] text-slate-800 dark:text-slate-200 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs hover:shadow"
              >
                <span>{text("Continuer vers la facturation","Continue to billing","المتابعة إلى الفوترة")}</span>
              </button>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className="px-4 py-2.5 text-sm sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                {text("Retour","Back","رجوع")}</button>
              <button
                type="submit"
                className="min-h-[46px] py-2.5 px-6 text-sm sm:text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-md shadow-orange-500/20 transition flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-white shrink-0" />
                <span>{text("Enregistrer l’abonné","Save subscriber","حفظ المشترك")}</span>
              </button>
            </div>
          )}
        </div>
      </form>
      </div>
    </Dialog>
  );
}
