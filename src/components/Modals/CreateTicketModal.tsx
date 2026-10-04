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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Incident Ticket</h3>
              <p className="text-xs text-slate-400">
                Dispatch field technician for repair or installation
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

        {clients.length === 0 ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">No Subscribers Registered</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                You must register at least one client before dispatching an incident ticket.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            {/* Client select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Subscriber / Location <span className="text-rose-400">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.neighborhood || 'Tétouan'} ({c.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'})
                  </option>
                ))}
              </select>
              {selectedClient && (
                <p className="text-[11px] text-slate-400 mt-1">
                  📍 {selectedClient.address || 'Tétouan'} | 📞 {selectedClient.phone}
                </p>
              )}
            </div>

          {/* Issue category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
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
                  className={`p-2.5 rounded-xl border text-left transition ${
                    category === cat.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-medium text-slate-200">{cat.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority Level <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  priority === 'normal'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  priority === 'high'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                High Priority
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1 ${
                  priority === 'urgent'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                Urgent
              </button>
            </div>
          </div>

          {/* Assigned Technician */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Assign to Technician <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {technicians.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setAssignedToTechnicianId(tech.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                    assignedToTechnicianId === tech.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-white">
                    {tech.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs">{tech.name}</div>
                    <div className="text-[10px] text-slate-400">{tech.specialty}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Problem description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description & Field Instructions <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ex: Client signale coupure après orage. Vérifier voyant PoE et alignement LiteBeam..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-amber-900/40 transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Dispatch Ticket
            </button>
          </div>
        </form>
      )}
    </div>
  </div>
);
}
