'use client';

import Dialog from '@/components/ui/Dialog';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { TicketCategory, TicketPriority } from '@/lib/types';
import { X, Wrench, CheckCircle, Zap } from 'lucide-react';

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
  const { clients, technicians, createTicket, language } = useStore();
  const text = (fr: string, en: string, ar: string) => language === 'ar' ? ar : language === 'en' ? en : fr;

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
    <Dialog onClose={onClose} label="Create Ticket">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg bg-[var(--surface)] sm:border sm:border-[var(--border)]/70 rounded-none sm:rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--border)]/70 bg-[var(--surface-muted)]/95 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-[var(--warning)] border border-amber-500/20 shrink-0">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--warning)]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text)]">{text("Créer un ticket","Create ticket","إنشاء تذكرة")}</h3>
              <p className="text-[12px] sm:text-sm text-[var(--muted)]">
                {text("Décrivez le problème et choisissez un technicien.","Describe the issue and choose a technician.","صف المشكلة واختر التقني.")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition cursor-pointer"
           aria-label={language === "ar" ? "إغلاق" : language === "en" ? "Close" : "Fermer"}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="p-10 text-center space-y-4 bg-[var(--surface-muted)]">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[var(--warning)] border border-amber-500/20 flex items-center justify-center mx-auto">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[var(--text)]">{text("Aucun abonné enregistré","No subscribers registered","لا يوجد مشتركون مسجلون")}</h4>
              <p className="text-sm text-[var(--muted)] max-w-xs mx-auto mt-1">
                {text("Ajoutez un abonné avant de créer un ticket.","Add a subscriber before creating a ticket.","أضف مشتركاً قبل إنشاء تذكرة.")}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              {text("Fermer","Close","إغلاق")}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Client select */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="CreateTicketModal-field-0">
                {text("Abonné","Subscriber","المشترك")}<span className="text-[var(--error)]">*</span>
              </label>
              <select
                dir="auto"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-amber-500 transition"
                required
                id="CreateTicketModal-field-0">
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.neighborhood || 'Tétouan'} ({c.hardware?.antennaModel || 'Ubiquiti LiteBeam 5AC'})
                  </option>
                ))}
              </select>
              {selectedClient && (
                <p className="text-[12px] text-[var(--muted)] mt-1">
                  📍 {selectedClient.address || 'Tétouan'} | 📞 {selectedClient.phone}
                </p>
              )}
            </div>

          {/* Issue category */}
          <div>
            <p className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" >
              {text("Type de problème","Issue type","نوع المشكلة")}<span className="text-[var(--error)]">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { id: 'no_internet', label: text('Coupure totale', 'No internet', 'انقطاع الإنترنت'), desc: text('CPE hors ligne / liaison coupée', 'CPE offline / link down', 'جهاز CPE غير متصل / انقطاع الرابط') },
                { id: 'weak_signal', label: text('Signal faible / lenteur', 'Weak signal / slow connection', 'إشارة ضعيفة / بطء الاتصال'), desc: text('Perte de paquets / alignement antenne', 'Packet loss / antenna alignment', 'فقدان الحزم / محاذاة الهوائي') },
                { id: 'power_adapter', label: text('PoE / alimentation', 'PoE / power supply', 'PoE / التغذية الكهربائية'), desc: text('Injecteur ou câble défectueux', 'Faulty power injector or cable', 'خلل في مزود الطاقة أو الكابل') },
                { id: 'new_installation', label: text('Nouvelle installation', 'New installation', 'تركيب جديد'), desc: text('Montage sur toiture et configuration', 'Rooftop mounting and setup', 'التثبيت على السطح والإعداد') },
                { id: 'router_config', label: text('Routeur / Wi-Fi', 'Router / Wi-Fi', 'الموجه / Wi-Fi'), desc: text('Réinitialisation PPPoE / mot de passe Wi-Fi', 'PPPoE reset / Wi-Fi password', 'إعادة ضبط PPPoE / كلمة مرور Wi-Fi') },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={category === cat.id as TicketCategory} onClick={() => setCategory(cat.id as TicketCategory)}
                  className={`p-2.5 rounded-xl border text-start transition cursor-pointer ${
                    category === cat.id
                      ? 'bg-amber-500/15 border-amber-500/50 text-[var(--warning)] font-semibold shadow-md shadow-black/40'
                      : 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border)]'
                  }`}
                >
                  <div className="font-medium text-[var(--text)]">{cat.label}</div>
                  <div className="text-[12px] text-[var(--muted)] mt-0.5">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" >
              {text("Priorité","Priority","الأولوية")}<span className="text-[var(--error)]">*</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                aria-pressed={priority === 'normal'} onClick={() => setPriority('normal')}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                  priority === 'normal'
                    ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--primary)] shadow-md shadow-black/40'
                    : 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border)]'
                }`}
              >
                {text("Normale","Normal","عادية")}</button>
              <button
                type="button"
                aria-pressed={priority === 'high'} onClick={() => setPriority('high')}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                  priority === 'high'
                    ? 'bg-amber-500/15 border-amber-500/50 text-[var(--warning)] shadow-md shadow-black/40'
                    : 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border)]'
                }`}
              >
                {text("Haute","High","مرتفعة")}</button>
              <button
                type="button"
                aria-pressed={priority === 'urgent'} onClick={() => setPriority('urgent')}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
                  priority === 'urgent'
                    ? 'bg-rose-500/20 border-rose-500/50 text-[var(--error)] shadow-lg shadow-black/50'
                    : 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border)]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[var(--error)] animate-pulse" />
                {text("Urgente","Urgent","عاجلة")}</button>
            </div>
          </div>

          {/* Assigned Technician */}
          <div>
            <p className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" >
              {text("Technicien assigné","Assigned technician","التقني المكلّف")}<span className="text-[var(--error)]">*</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {technicians.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  aria-pressed={assignedToTechnicianId === tech.id}
                  onClick={() => setAssignedToTechnicianId(tech.id)}
                  className={`p-3 rounded-xl border text-start transition flex items-center gap-3 cursor-pointer ${
                    assignedToTechnicianId === tech.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-[var(--success)]'
                      : 'bg-[var(--surface-muted)] border-[var(--border)]/70 text-[var(--muted)] hover:border-[var(--border)]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--surface-muted)] flex items-center justify-center font-bold text-sm text-[var(--text)]">
                    {tech.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text)] text-sm">{tech.name}</div>
                    <div className="text-[12px] text-[var(--muted)]">{tech.specialty}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Problem description */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5" htmlFor="CreateTicketModal-field-4">
              {text("Description et instructions","Description and instructions","الوصف والتعليمات")}<span className="text-[var(--error)]">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder={text('Ex : coupure après un orage. Vérifier le PoE et l’antenne.', 'E.g. outage after a storm. Check PoE and antenna alignment.', 'مثال: انقطاع بعد عاصفة. تحقق من PoE ومحاذاة الهوائي.')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500 transition"
              id="CreateTicketModal-field-4"   />
          </div>

          </div>

          {/* Sticky Modal Footer CTA Button Bar */}
          <div className="bg-[var(--surface-muted)]/95 backdrop-blur-md p-4 sm:px-6 sm:py-4 border-t border-[var(--border)] flex items-center justify-between sm:justify-end gap-3 z-10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] rounded-xl transition cursor-pointer"
            >
              {text("Annuler","Cancel","إلغاء")}</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial min-h-[48px] px-5 py-3 text-sm sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 disabled:opacity-50 text-slate-950 rounded-xl shadow-lg shadow-amber-500/15 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-slate-950 shrink-0" />
              <span>{text("Créer le ticket","Create ticket","إنشاء التذكرة")}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  </Dialog>
);
}
