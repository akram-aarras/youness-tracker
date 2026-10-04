'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  X,
  UserPlus,
  Radio,
  Wifi,
  MapPin,
  CreditCard,
  CheckCircle,
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

const ANTENNA_MODELS = [
  'Ubiquiti LiteBeam 5AC',
  'Ubiquiti LiteBeam 5AC Gen2',
  'Ubiquiti NanoStation 5AC Loco',
  'Ubiquiti PowerBeam 5AC ISO',
  'MikroTik SXTsq 5 ac',
  'MikroTik DISC Lite5',
  'Ubiquiti airFiber 60 LR',
];

const ROUTER_MODELS = [
  'Standard Router',
  'TP-Link Archer C6 AC1200',
  'TP-Link Archer C54',
  'Tenda AC10 Gigabit Dual-Band',
  'Tenda TX3 AX1800 Wi-Fi 6',
  'Xiaomi Router 4A Gigabit',
  'Xiaomi Router AX3000 Wi-Fi 6',
  'MikroTik hEX S + UniFi U6-Lite',
];

const SECTOR_TOWERS = [
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
  const [signalStrengthDbm, setSignalStrengthDbm] = useState<number>(-65);

  // Subscription Setup
  const [monthlyFee, setMonthlyFee] = useState<number>(100);
  const [subscriptionPlan, setSubscriptionPlan] = useState('Standard Wi-Fi Plan (100 MAD)');
  const [installationDate, setInstallationDate] = useState('2026-10-04');
  const [nextDueDate, setNextDueDate] = useState('2026-11-04');
  const [initialPayment, setInitialPayment] = useState(true);
  const [notes, setNotes] = useState('');

  // Auto-fill SSID and PPPoE suggestions when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (!pppoeUsername || pppoeUsername.startsWith('cli_') || pppoeUsername.startsWith('user_')) {
      setPppoeUsername(clean ? `user_${clean}` : '');
    }
    if (!wifiSsid || wifiSsid.endsWith('_WiFi')) {
      setWifiSsid(val.trim() ? `${val.trim().split(' ')[0]}_WiFi` : '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setActiveTab('info');
      return;
    }

    const trimmedName = name.trim();
    const cleanUserSlug = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const autoPppoeUser = cleanUserSlug ? `user_${cleanUserSlug}` : 'user_pending';

    addClient({
      name: trimmedName,
      phone: phone.trim(),
      neighborhood: neighborhood.trim() || 'Wilaya',
      address: address.trim() || 'Tétouan',
      googleMapsUrl:
        googleMapsUrl.trim() || 'https://maps.google.com/?q=35.5784,-5.3684',
      monthlyFee: Number(monthlyFee) > 0 ? Number(monthlyFee) : 100,
      subscriptionPlan: subscriptionPlan || 'Standard Wi-Fi Plan (100 MAD)',
      installationDate: installationDate || '2026-10-04',
      nextDueDate: nextDueDate || '2026-11-04',
      initialPayment,
      notes: notes.trim() || undefined,
      hardware: {
        antennaModel: antennaModel.trim() || 'Ubiquiti LiteBeam 5AC',
        antennaMac: antennaMac.trim().toUpperCase() || 'N/A',
        antennaIp: antennaIp.trim() || '192.168.10.150',
        routerModel: routerModel.trim() || 'Standard Router',
        wifiSsid: wifiSsid.trim() || `${trimmedName}_WiFi`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Register New Installation</h3>
              <p className="text-xs text-slate-400">
                Onboard subscriber in Tétouan, configure wireless CPE, & set billing
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'info'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            1. Client & Location
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'hardware'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            2. Hardware & Radio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'billing'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            3. Subscription & Billing
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number (Morocco) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="06XXXXXXXX ou +2126XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition"
                  />
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Used by field technicians for 1-tap navigation from mobile. Defaults to Tétouan center if left blank.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('hardware')}
                  className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition"
                >
                  Next: Hardware Details →
                </button>
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-cyan-500 transition"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
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
                    type="number"
                    max="-30"
                    min="-90"
                    placeholder="-65"
                    value={signalStrengthDbm}
                    onChange={(e) => setSignalStrengthDbm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  ← Back to Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('billing')}
                  className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition"
                >
                  Next: Billing Setup →
                </button>
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
                      if (newPlan.includes('100 MAD')) setMonthlyFee(100);
                      else if (newPlan.includes('120 MAD')) setMonthlyFee(120);
                      else if (newPlan.includes('150 MAD')) setMonthlyFee(150);
                      else if (newPlan.includes('200 MAD')) setMonthlyFee(200);
                      else if (newPlan.includes('300 MAD')) setMonthlyFee(300);
                      else if (newPlan.includes('500 MAD')) setMonthlyFee(500);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  >
                    <option value="Standard Wi-Fi Plan (100 MAD)">Standard Wi-Fi Plan (Default: 100 MAD)</option>
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
                      Default: 100 MAD
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-cyan-500 transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Editable base rate for this subscriber. Override anytime.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Installation Date
                  </label>
                  <input
                    type="date"
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Next Due Date (1st Renewal)
                  </label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {/* Immediate payment toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Record 1st Month Payment Now
                  </div>
                  <div className="text-xs text-slate-400">
                    Automatically generates a receipt and sets client status to Paid
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={initialPayment}
                  onChange={(e) => setInitialPayment(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Technician Installation Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Câble Cat6 blindé passé par la façade, mât fixé sur cheminée, prise PoE salon..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('hardware')}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  ← Back to Hardware
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-900/40 transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Installation & Onboard
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
