'use client';

import React, { useState } from 'react';
import { useStore, getTodayDateStr, addMonthsToDateStr, isValidMoroccanPhone, cleanMoroccanPhoneNumber } from '@/lib/store';
import {
  X,
  UserPlus,
  Radio,
  Wifi,
  MapPin,
  CreditCard,
  CheckCircle,
  Loader2,
} from 'lucide-react';

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
  const { addClient } = useStore();

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
  const [antennaIp, setAntennaIp] = useState('192.168.10.');
  const [routerModel, setRouterModel] = useState('Standard Router');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [pppoeUsername, setPppoeUsername] = useState('');
  const [pppoePassword, setPppoePassword] = useState('123456');
  const [sectorTower, setSectorTower] = useState('Tour Boujarah (Relais Centre)');
  const [signalStrengthDbm, setSignalStrengthDbm] = useState<string | number>(-65);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (isSubmitting) return;
    if (!name.trim()) {
      setActiveTab('info');
      return;
    }
    if (phone.trim() && !isValidMoroccanPhone(phone)) {
      setActiveTab('info');
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedName = name.trim();
      const cleanUserSlug = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '').replace(/_+/g, '_');
      const fallbackId = Math.floor(100 + Math.random() * 900);
      const autoPppoeUser = cleanUserSlug ? `user_${cleanUserSlug}` : `client_${fallbackId}`;
      const autoWifiSsid = cleanUserSlug ? `${trimmedName.split(' ')[0]}_WiFi` : `WiFi_${fallbackId}`;

      const rawDbm = typeof signalStrengthDbm === 'number'
        ? signalStrengthDbm
        : parseInt(String(signalStrengthDbm).replace(/[^\d-]/g, ''), 10);
      const parsedSignalDbm = isNaN(rawDbm) ? -65 : Math.max(-100, Math.min(-10, rawDbm));

      addClient({
        name: trimmedName,
        phone: phone.trim() ? (cleanMoroccanPhoneNumber(phone) || phone.trim()) : '',
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
          signalStrengthDbm: parsedSignalDbm,
          sectorTower: sectorTower.trim() || 'Tour Boujarah (Relais Centre)',
        },
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl bg-white dark:bg-slate-900 sm:border sm:border-slate-200/80 dark:sm:border-slate-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shrink-0">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 shrink-0">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Register New Installation</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Onboard subscriber in Tétouan, configure wireless CPE, & set billing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 sm:px-6 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'info'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>1. Client & Location</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'hardware'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>2. Hardware & Radio</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'billing'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>3. Subscription & Billing</span>
          </button>
        </div>

        {/* Form Body with Sticky Footer */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="p-4 sm:p-6 space-y-4">
          {/* TAB 1: CLIENT INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subscriber Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Taha Bennani"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number (Morocco) <span className="text-slate-500 font-normal text-[11px]">(Optionnel / اختياري)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="06XXXXXXXX ou +2126XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] font-mono focus:outline-none focus:border-amber-500/50 transition"
                  />
                  {phone.trim().length > 0 && !isValidMoroccanPhone(phone) && (
                    <p className="text-[11px] text-amber-400/90 mt-1">
                      Format suggéré: 06XXXXXXXX, 07XXXXXXXX ou +2126XXXXXXXX
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Neighborhood / Hay (Tétouan) <span className="text-slate-500 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    list="tetouan-neighborhoods"
                    placeholder="Ex: Wilaya, Boujarah, Martil..."
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                  />
                  <datalist id="tetouan-neighborhoods">
                    {TETOUAN_NEIGHBORHOODS.map((area) => (
                      <option key={area} value={area} />
                    ))}
                  </datalist>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select from Tétouan list or type any custom neighborhood.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Street / Derb & Address <span className="text-slate-500 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Rue 14, Derb..., Immeuble 3, 2ème étage"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Free text entry with no dropdown restrictions.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Google Maps Location Link or GPS Coordinates <span className="text-slate-500 font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: https://maps.google.com/?q=35.5784,-5.3684 ou 35.5784, -5.3684"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Used by field technicians for 1-tap navigation from mobile. Defaults to Tétouan center if left blank.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HARDWARE & RADIO */}
          {activeTab === 'hardware' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Antenna / CPE Model <span className="text-slate-500 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    list="antenna-models"
                    value={antennaModel}
                    onChange={(e) => setAntennaModel(e.target.value)}
                    placeholder="Ubiquiti LiteBeam 5AC"
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                  />
                  <datalist id="antenna-models">
                    {ANTENNA_MODELS.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Antenna MAC Address <span className="text-slate-500 font-normal text-[11px]">(Optional, defaults to N/A)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: DC:9F:DB:XX:XX:XX (Defaults to N/A)"
                    value={antennaMac}
                    onChange={(e) => setAntennaMac(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] font-mono uppercase focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Access Point / Sector Tower <span className="text-slate-500 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    list="sector-towers"
                    value={sectorTower}
                    onChange={(e) => setSectorTower(e.target.value)}
                    placeholder="Tour Boujarah (Relais Centre)"
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                  />
                  <datalist id="sector-towers">
                    {SECTOR_TOWERS.map((st) => (
                      <option key={st} value={st} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Aligned Signal Level (dBm) <span className="text-slate-500 font-normal text-[11px]">(Optional, defaults to -65)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="-65"
                    value={signalStrengthDbm}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || val === '-') {
                        setSignalStrengthDbm(val);
                      } else {
                        const cleaned = val.replace(/[^\d-]/g, '');
                        const sanitized = cleaned.startsWith('-')
                          ? '-' + cleaned.slice(1).replace(/-/g, '')
                          : cleaned.replace(/-/g, '');
                        setSignalStrengthDbm(sanitized);
                      }
                    }}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] font-mono focus:outline-none focus:border-amber-500/50 transition"
                  />
                  <div className="text-[11px] text-slate-400 mt-1">
                    Optimal: between -55 dBm and -65 dBm (Default: -65 dBm)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Indoor Wi-Fi Router Model <span className="text-slate-500 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    list="router-models"
                    value={routerModel}
                    onChange={(e) => setRouterModel(e.target.value)}
                    placeholder="Standard Router"
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                  />
                  <datalist id="router-models">
                    {ROUTER_MODELS.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Client Wi-Fi SSID <span className="text-slate-500 font-normal text-[11px]">(Optional, defaults to Name_WiFi)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Client_WiFi (Auto-generated if empty)"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    PPPoE Username <span className="text-slate-500 font-normal text-[11px]">(Optional, auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: user_client (Auto-generated if empty)"
                    value={pppoeUsername}
                    onChange={(e) => setPppoeUsername(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] font-mono focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    PPPoE Password <span className="text-slate-500 font-normal text-[11px]">(Optional, defaults to 123456)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={pppoePassword}
                    onChange={(e) => setPppoePassword(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] font-mono focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subscription Plan
                  </label>
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
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                  >
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
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Monthly Fee (MAD / DH)
                    </label>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Standard: 100 MAD
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] font-mono font-bold focus:outline-none focus:border-amber-500/50 transition"
                  />
                  <p className="text-[11px] text-[#958B9F] mt-1">
                    Editable base rate for this subscriber. Override anytime.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E0D8EB] uppercase tracking-wider mb-1.5">
                    Installation Date
                  </label>
                  <input
                    type="date"
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] font-mono focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E0D8EB] uppercase tracking-wider mb-1.5">
                    Next Due Date (1st Renewal)
                  </label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] font-mono focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
              </div>

              {/* Immediate payment toggle */}
              <div className="p-4 rounded-xl bg-[#130F1A] border border-[#261E33] flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#F4F0F8]">
                    Record 1st Month Payment Now
                  </div>
                  <div className="text-xs text-[#958B9F]">
                    Automatically generates a receipt and sets client status to Paid
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={initialPayment}
                  onChange={(e) => setInitialPayment(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E0D8EB] uppercase tracking-wider mb-1.5">
                  Technician Installation Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Câble Cat6 blindé passé par la façade, mât fixé sur cheminée, prise PoE salon..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Modal Footer CTA Button Bar */}
        <div className="sticky bottom-0 bg-[#130F1A]/95 backdrop-blur-md p-4 sm:px-6 sm:py-4 border-t border-[#261E33] flex items-center justify-between gap-3 z-10 shrink-0">
          {activeTab === 'info' && (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hardware')}
                className="min-h-[46px] py-2.5 px-5 text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs hover:shadow"
              >
                <span>Étape Suivante: Matériel →</span>
              </button>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('billing')}
                className="min-h-[46px] py-2.5 px-5 text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs hover:shadow"
              >
                <span>Étape Suivante: Facturation →</span>
              </button>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('hardware')}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition cursor-pointer"
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[46px] py-2.5 px-6 text-xs sm:text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-white shrink-0" />
                    <span>حفظ وتأكيد التثبيت</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}
