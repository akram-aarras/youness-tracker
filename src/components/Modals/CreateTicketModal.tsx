'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { TicketCategory, TicketPriority } from '@/lib/types';
import {
  X,
  Wrench,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  Zap,
} from 'lucide-react';

interface Props {
  initialClientId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTicketModal({
  initialClientId,
  onClose,
  onSuccess,
}: Props) {
  const { clients, technicians, createTicket } = useStore();

  const [clientId, setClientId] = useState<string>(
    initialClientId || (clients[0]?.id ?? '')
  );
  const [category, setCategory] = useState<TicketCategory>('no_internet');
  const [priority, setPriority] = useState<TicketPriority>('high');
  const [assignedToTechnicianId, setAssignedToTechnicianId] = useState<string>(
    technicians[0]?.id ?? 'tech-1'
  );
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClient = clients.find((c) => c.id === clientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !description.trim()) return;

    setIsSubmitting(true);
    try {
      createTicket({
        clientId,
        category,
        priority,
        assignedToTechnicianId,
        description: description.trim(),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg bg-[#191522] sm:border sm:border-[#2D253B]/70 rounded-none sm:rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#2D253B]/70 bg-[#130F1A]/95 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F4F0F8]">Create Incident Ticket</h3>
              <p className="text-[11px] sm:text-xs text-[#958B9F]">
                Dispatch field technician for repair or installation
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

        {clients.length === 0 ? (
          <div className="p-10 text-center space-y-4 bg-[#130F1A]">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#F4F0F8]">No Subscribers Registered</h4>
              <p className="text-xs text-[#958B9F] max-w-xs mx-auto mt-1">
                You must register at least one client before dispatching an incident ticket.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#241E30] hover:bg-[#2C243B] text-[#E0D8EB] rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
            <div className="p-4 sm:p-6 space-y-4">
            {/* Client select */}
            <div>
              <label className="block text-xs font-semibold text-[#E0D8EB] uppercase tracking-wider mb-1.5">
                Subscriber / Location <span className="text-rose-400">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] focus:outline-none focus:border-amber-500 transition"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.neighborhood || 'Tétouan'} ({c.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'})
                  </option>
                ))}
              </select>
              {selectedClient && (
                <p className="text-[11px] text-[#958B9F] mt-1">
                  📍 {selectedClient.address || 'Tétouan'} | 📞 {selectedClient.phone || 'Non renseigné'}
                </p>
              )}
            </div>

          {/* Issue category */}
          <div>
            <label className="block text-xs font-semibold text-[#E0D8EB] uppercase tracking-wider mb-1.5">
              Issue Category <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'no_internet', label: 'Coupure Totale (No Net)', desc: 'CPE offline / Link down' },
                { id: 'weak_signal', label: 'Signal Faible / Lenteur', desc: 'Packet loss / Antenna misalignment' },
                { id: 'power_adapter', label: 'PoE / Alimentation', desc: 'Power injector burnt / Cable' },
                { id: 'new_installation', label: 'Nouvelle Installation', desc: 'Rooftop mounting & setup' },
                { id: 'router_config', label: 'Routeur / Wi-Fi', desc: 'PPPoE reset / Wi-Fi password' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as TicketCategory)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    category === cat.id
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold shadow-md shadow-black/40'
                      : 'bg-[#130F1A] border-[#261E33] text-[#958B9F] hover:border-[#3A2F4C]'
                  }`}
                >
                  <div className="font-medium text-[#F4F0F8]">{cat.label}</div>
                  <div className="text-[10px] text-[#958B9F] mt-0.5">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-[#E0D8EB] uppercase tracking-wider mb-1.5">
              Priority Level <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  priority === 'normal'
                    ? 'bg-[#382647] border-[#523368] text-[#F3E8FF] shadow-md shadow-black/40'
                    : 'bg-[#130F1A] border-[#261E33] text-[#958B9F] hover:border-[#3A2F4C]'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  priority === 'high'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-md shadow-black/40'
                    : 'bg-[#130F1A] border-[#261E33] text-[#958B9F] hover:border-[#3A2F4C]'
                }`}
              >
                High Priority
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
                  priority === 'urgent'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-lg shadow-black/50'
                    : 'bg-[#130F1A] border-[#261E33] text-[#958B9F] hover:border-[#3A2F4C]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                Urgent
              </button>
            </div>
          </div>

          {/* Assigned Technician */}
          <div>
            <label className="block text-xs font-semibold text-[#E0D8EB] uppercase tracking-wider mb-1.5">
              Assign to Technician <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {technicians.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setAssignedToTechnicianId(tech.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                    assignedToTechnicianId === tech.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-[#130F1A] border-[#2D253B]/70 text-[#958B9F] hover:border-[#3A2F4C]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#241E30] flex items-center justify-center font-bold text-sm text-[#F4F0F8]">
                    {tech.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-[#F4F0F8] text-xs">{tech.name}</div>
                    <div className="text-[10px] text-[#958B9F]">{tech.specialty}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Problem description */}
          <div>
            <label className="block text-xs font-semibold text-[#E0D8EB] uppercase tracking-wider mb-1.5">
              Description & Field Instructions <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ex: Client signale coupure après orage. Vérifier voyant PoE et alignement LiteBeam..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#130F1A] border border-[#2D253B]/70 rounded-xl px-3.5 py-2.5 text-sm text-[#F4F0F8] placeholder-[#958B9F] focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          </div>

          {/* Sticky Modal Footer CTA Button Bar */}
          <div className="sticky bottom-0 bg-[#130F1A]/95 backdrop-blur-md p-4 sm:px-6 sm:py-4 border-t border-[#261E33] flex items-center justify-between sm:justify-end gap-3 z-10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium text-[#958B9F] hover:text-[#F4F0F8] hover:bg-[#241E30] rounded-xl transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial min-h-[48px] px-5 py-3 text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 disabled:opacity-50 text-slate-950 rounded-xl shadow-lg shadow-amber-500/15 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-slate-950 shrink-0" />
              <span>إرسال تذكرة العطل</span>
            </button>
          </div>
        </form>
      )}
    </div>
  </div>
);
}
