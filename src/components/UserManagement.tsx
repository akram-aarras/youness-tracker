'use client';

import Dialog from '@/components/ui/Dialog';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { User, Role } from '@/lib/types';
import { ShieldCheck, Wrench, UserPlus, Search, CheckCircle2, XCircle, Trash2, Copy, Check, Eye, EyeOff, Sparkles, Phone, Mail, AlertTriangle, Briefcase, KeyRound, ShieldAlert, Edit2, Compass, Download, Upload, Database } from 'lucide-react';

export default function UserManagement() {
  const {
    currentUser,
    language,
    users,
    tickets,
    addUser,
    updateUser,
    resetUserPassword,
    updateUserStatus,
    deleteUser,
    exportDataAsJSON,
    importDataFromJSON,
  } = useStore();

  const text = (fr: string, en: string, ar: string) => language === 'ar' ? ar : language === 'en' ? en : fr;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'technician' | 'field_lead'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form State for Add User
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'technician' as Role,
    specialty: 'Antennes Ubiquiti & Alignement RF',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State for Edit User
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'technician' as Role,
    specialty: '',
  });

  // Form State for Reset Password
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [showResetPasswordInput, setShowResetPasswordInput] = useState(false);

  // Feedback State
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Compute stats
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const techCount = users.filter((u) => u.role === 'technician' || u.role === 'field_lead').length;
  const activeCount = users.filter((u) => u.status === 'active').length;

  // Filtered users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.specialty && user.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get active tickets for a technician
  const getAssignedTicketsCount = (user: User) => {
    if (user.role === 'admin') return 0;
    const techId = user.technicianId || user.id;
    return tickets.filter(
      (t) =>
        (t.assignedToTechnicianId === techId || t.assignedToTechnicianId === user.id) &&
        t.status !== 'resolved'
    ).length;
  };

  const handleCopyCredentials = (user: User, customPass?: string) => {
    const pass = customPass || user.password || 'Tech123!';
    const text = `Youness WiFi — Accès Espace Terrain / Personnel:\nIdentifiant / Email: ${user.email}\nMot de passe: ${pass}\nPortail d'accès: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopiedUserId(user.id);
    setTimeout(() => setCopiedUserId(null), 3000);
  };

  const handleGeneratePassword = () => {
    const special = ['!', '@', '#', '$', '%'][Math.floor(Math.random() * 5)];
    const generated = `Atlas${new Date().getFullYear()}#${Math.floor(1000 + Math.random() * 9000)}${special}`;
    return generated;
  };

  const handleExportBackup = () => {
    try {
      const jsonContent = exportDataAsJSON();
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const datePart = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `youness-wifi-backup-${datePart}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupStatus({
        type: 'success',
        message: 'تم تصدير النسخة الاحتياطية بنجاح وتنزيل ملف JSON محفوظ.',
      });
      setTimeout(() => setBackupStatus(null), 5000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'خطأ غير متوقع';
      setBackupStatus({
        type: 'error',
        message: `تعذر تصدير النسخة الاحتياطية: ${errorMsg}`,
      });
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          throw new Error('الملف فارغ');
        }
        const res = importDataFromJSON(text);
        if (res.success) {
          setBackupStatus({
            type: 'success',
            message: `تم استرجاع البيانات بنجاح! (${res.clientsCount} مشترك، ${res.ticketsCount} تذكرة، ${res.paymentsCount} دفعة)`,
          });
          setTimeout(() => setBackupStatus(null), 6000);
        } else {
          setBackupStatus({
            type: 'error',
            message: `فشل استرجاع البيانات: ${res.error}`,
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'تنسيق غير مدعوم';
        setBackupStatus({
          type: 'error',
          message: `الملف غير صالح أو تالف: ${errorMsg}`,
        });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const emailExists = users.some(
      (u) => u.email.toLowerCase() === formData.email.toLowerCase().trim()
    );
    if (emailExists) {
      setFormError('Cette adresse email est déjà utilisée par un autre compte.');
      return;
    }

    try {
      const created = addUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        password: formData.password.trim(),
        specialty: formData.role !== 'admin' ? formData.specialty : undefined,
      });

      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: 'Tech' + Math.floor(100 + Math.random() * 900) + '!',
        role: 'technician',
        specialty: 'Antennes Ubiquiti & Alignement RF',
      });
      setSuccessToast(`Compte pour ${created.name} créé avec succès !`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch {
      setFormError('Une erreur est survenue lors de la création du compte.');
    }
  };

  const handleOpenEdit = (user: User) => {
    setUserToEdit(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      specialty: user.specialty || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    updateUser(userToEdit.id, {
      name: editFormData.name.trim(),
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim(),
      role: editFormData.role,
      specialty: editFormData.specialty.trim() || undefined,
    });

    setUserToEdit(null);
    setSuccessToast(`Compte de ${editFormData.name} mis à jour avec succès.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleOpenResetPassword = (user: User) => {
    setUserToResetPassword(user);
    setNewPasswordValue(handleGeneratePassword());
    setShowResetPasswordInput(true);
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToResetPassword || !newPasswordValue.trim()) return;

    resetUserPassword(userToResetPassword.id, newPasswordValue.trim());
    handleCopyCredentials(userToResetPassword, newPasswordValue.trim());
    setUserToResetPassword(null);
    setSuccessToast(`Nouveau mot de passe enregistré et copié dans le presse-papier !`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id);
    setUserToDelete(null);
    setSuccessToast(`Compte supprimé avec succès.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="page-view team-view">
      {/* Top Banner & Header */}
      <div className="page-heading flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)]/70 shadow-xl shadow-black/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-[var(--warning)] border border-amber-500/20">
              <ShieldCheck className="w-5 h-5 text-[var(--warning)]" />
            </span>
            <h1 className="text-xl font-black text-[var(--text)] tracking-tight">
              {text('Équipe & accès', 'Team & access', 'الفريق والصلاحيات')}
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)] max-w-xl leading-relaxed">
            {text('Gérez votre équipe, ses accès et ses interventions.', 'Manage your team, their access, and field work.', 'أدر فريقك وصلاحياته وتدخلاته.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setFormData(previous => ({ ...previous, password: handleGeneratePassword() })); setShowAddModal(true); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/15 transition cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4 text-slate-950" />
          <span>{text('Ajouter un membre', 'Add team member', 'إضافة عضو')}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div role="status" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[var(--success)] text-sm font-semibold flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-[var(--muted)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="team-metrics grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]/70 shadow-xl shadow-black/40 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-secondary)]">
            <Briefcase className="w-5 h-5 text-[var(--warning)]" />
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider">
              Total Membres
            </div>
            <div className="text-xl font-black text-[var(--text)] font-mono">{totalUsers}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]/70 shadow-xl shadow-black/40 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[var(--accent-soft)]/50 border border-[var(--accent-border)] text-[var(--primary)]">
            <ShieldCheck className="w-5 h-5 text-[var(--warning)]" />
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider">
              Admins NOC
            </div>
            <div className="text-xl font-black text-[var(--primary)] font-mono">{adminCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]/70 shadow-xl shadow-black/40 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-800/40 text-[var(--success)]">
            <Wrench className="w-5 h-5 text-[var(--success)]" />
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider">
              Techniciens & Leads
            </div>
            <div className="text-xl font-black text-[var(--success)] font-mono">{techCount}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]/70 shadow-xl shadow-black/40 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--success)]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider">
              Comptes Actifs
            </div>
            <div className="text-xl font-black text-[var(--success)] font-mono">
              {activeCount} / {totalUsers}
            </div>
          </div>
        </div>
      </div>

      {/* LocalStorage Data Safety & Backup Tool (تصدير واسترجاع البيانات) */}
      <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-[var(--warning)] border border-amber-500/30 shrink-0">
              <Database className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                <span>{text('Sauvegarde & restauration', 'Backup & restore', 'النسخ الاحتياطي والاسترجاع')}</span>
                <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-amber-500/10 text-[var(--warning)] border border-amber-500/20 font-mono">
                  JSON Safe
                </span>
              </h2>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                {text('Gardez une copie de vos abonnés, paiements et tickets.', 'Keep a copy of your subscribers, payments, and tickets.', 'احتفظ بنسخة من المشتركين والمدفوعات والتذاكر.')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Export Button */}
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--warning)] hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50 text-sm font-bold transition cursor-pointer active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4 text-[var(--warning)] shrink-0" />
              <span>{text('Exporter la sauvegarde', 'Export backup', 'تصدير النسخة الاحتياطية')}</span>
            </button>

            {/* Import Button */}
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] text-sm font-bold transition cursor-pointer active:scale-95 shadow-sm"
            >
              <Upload className="w-4 h-4 text-[var(--muted)] shrink-0" />
              <span>{text('Restaurer une sauvegarde', 'Restore backup', 'استرجاع نسخة احتياطية')}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportBackup}
                className="hidden"
               aria-label="input"/>
            </button>
          </div>
        </div>

        {/* Backup Feedback Toast */}
        {backupStatus && (
          <div
            className={`p-3.5 rounded-xl border text-sm font-semibold flex items-center justify-between animate-in fade-in duration-150 ${
              backupStatus.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--success)]'
                : 'bg-rose-500/10 border-rose-500/30 text-[var(--error)]'
            }`}
          >
            <div className="flex items-center gap-2">
              {backupStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[var(--error)] shrink-0" />
              )}
              <span>{backupStatus.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setBackupStatus(null)}
              className="text-[var(--muted)] hover:text-[var(--text)] px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Search & Filters Controls */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]/70 shadow-xl shadow-black/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone ou spécialité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl pl-9.5 pr-4 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
           aria-label="Rechercher par nom, email, téléphone ou spécialité..."/>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="w-full sm:w-auto bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
           aria-label="role Filter">
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateurs NOC</option>
            <option value="technician">Techniciens Terrain</option>
            <option value="field_lead">Chefs d&apos;Équipe (Field Leads)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full sm:w-auto bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
           aria-label="status Filter">
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Désactivé</option>
          </select>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border)]/70 space-y-3">
            <Briefcase className="w-10 h-10 text-[var(--muted)] mx-auto" />
            <h3 className="text-sm font-bold text-[var(--text)]">Aucun membre trouvé</h3>
            <p className="text-sm text-[var(--muted)]">
              Aucun compte ne correspond à vos critères de recherche.
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isMe = currentUser?.id === user.id;
            const isRootAdmin = user.email === 'youness@atlasnet.ma' || user.id === 'user-admin';
            const assignedTickets = getAssignedTicketsCount(user);

            return (
              <div
                key={user.id}
                className={`p-5 rounded-2xl bg-[var(--surface)] border transition-all duration-200 shadow-lg shadow-black/30 ${
                  user.status === 'inactive'
                    ? 'border-[var(--border)]/40 opacity-60 bg-[var(--surface-muted)]'
                    : isMe
                    ? 'border-amber-500/40 shadow-amber-500/5'
                    : 'border-[var(--border)]/70 hover:border-[var(--border)]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: User Avatar & Core Details */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--surface-muted)] to-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-xl shadow-md">
                        {user.avatar || (user.role === 'admin' ? '👨‍💼' : user.role === 'field_lead' ? '⚡' : '🔧')}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--surface)] ${
                          user.status === 'active' ? 'bg-emerald-400' : 'bg-rose-500'
                        }`}
                        title={user.status === 'active' ? 'Compte Actif' : 'Compte Inactif'}
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-[var(--text)] truncate">
                          {user.name}
                        </span>
                        {isMe && (
                          <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--accent-border)]">
                            Vous (Session Actuelle)
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[12px] font-bold flex items-center gap-1 ${
                            user.role === 'admin'
                              ? 'bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--accent-border)]'
                              : user.role === 'field_lead'
                              ? 'bg-amber-500/10 text-[var(--warning)] border border-amber-500/30'
                              : 'bg-emerald-500/10 text-[var(--success)] border border-emerald-500/30'
                          }`}
                        >
                          {user.role === 'admin' ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-[var(--warning)]" />
                              <span>Admin NOC (Youness)</span>
                            </>
                          ) : user.role === 'field_lead' ? (
                            <>
                              <Compass className="w-3 h-3 text-[var(--warning)]" />
                              <span>Chef d&apos;Équipe (Field Lead)</span>
                            </>
                          ) : (
                            <>
                              <Wrench className="w-3 h-3 text-[var(--success)]" />
                              <span>Technicien Terrain</span>
                            </>
                          )}
                        </span>
                        {user.status === 'inactive' && (
                          <span className="px-2 py-0.5 rounded-full text-[12px] font-bold bg-rose-500/10 text-[var(--error)] border border-rose-500/30">
                            Compte Désactivé
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-[var(--muted)] flex-wrap">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Mail className="w-3.5 h-3.5 text-[var(--muted)]" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-[var(--muted)]" />
                          <span>{user.phone}</span>
                        </div>
                        {user.specialty && (
                          <div className="text-[12px] text-[var(--success)] bg-emerald-500/10 border border-emerald-800/40 px-2 py-0.5 rounded-lg">
                            {user.specialty}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Assigned Tasks Counter & Action Buttons */}
                  <div className="flex items-center gap-2 justify-end flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border)]">
                    {/* Active Tickets Pill (for technicians) */}
                    {user.role !== 'admin' && (
                      <div className="px-3 py-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[12px] flex items-center gap-2">
                        <span className="text-[var(--muted)]">Tâches:</span>
                        <span
                          className={`font-bold font-mono ${
                            assignedTickets > 0 ? 'text-[var(--warning)]' : 'text-[var(--muted)]'
                          }`}
                        >
                          {assignedTickets} active(s)
                        </span>
                      </div>
                    )}

                    {/* Copy Credentials Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(user)}
                      title="Copier les identifiants pour le technicien (WhatsApp / SMS)"
                      className="p-2 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] transition flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
                    >
                      {copiedUserId === user.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                          <span className="text-[var(--success)] text-[12px]">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[var(--warning)]" />
                          <span className="text-[12px]">Identifiants</span>
                        </>
                      )}
                    </button>

                    {/* Edit Staff Details */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(user)}
                      title="Modifier les informations"
                      className="p-2 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] text-sm font-semibold transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Reset Password Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenResetPassword(user)}
                      title="Changer / Réinitialiser le mot de passe"
                      className="p-2 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] text-[var(--warning)] hover:text-amber-200 border border-[var(--border)] text-sm font-semibold transition cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>

                    {/* Status Toggle (Activate / Deactivate) */}
                    {!isRootAdmin && !isMe && (
                      <button
                        type="button"
                        onClick={() =>
                          updateUserStatus(
                            user.id,
                            user.status === 'active' ? 'inactive' : 'active'
                          )
                        }
                        className={`p-2 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                          user.status === 'active'
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-[var(--warning)] border-amber-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-[var(--success)] border-emerald-500/30'
                        }`}
                        title={user.status === 'active' ? 'Désactiver le compte' : 'Activer le compte'}
                      >
                        {user.status === 'active' ? (
                          <XCircle className="w-4 h-4 text-[var(--warning)]" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                        )}
                      </button>
                    )}

                    {/* Delete Account Button */}
                    {!isRootAdmin && !isMe && (
                      <button
                        type="button"
                        onClick={() => setUserToDelete(user)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-[var(--error)] border border-rose-500/30 text-sm transition cursor-pointer"
                        title="Supprimer ce compte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD NEW MEMBER MODAL */}
      {showAddModal && (
        <Dialog onClose={() => setShowAddModal(false)} label="User Management">
          <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-none sm:rounded-2xl max-w-lg w-full h-full sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-4 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[var(--border)] shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--accent-border)]">
                  <UserPlus className="w-5 h-5 text-[var(--warning)]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text)]">
                    Ajouter un Membre du Personnel
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    Créer un compte technicien terrain, chef d&apos;équipe ou administrateur
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1.5 cursor-pointer rounded-lg hover:bg-[var(--surface-muted)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex-1 min-h-0 overflow-hidden flex flex-col text-sm">
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[var(--error)] text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1" htmlFor="UserManagement-field-0">
                    Nom Complet <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Karim Alami"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                    id="UserManagement-field-0"/>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--text-secondary)] font-semibold mb-1" htmlFor="UserManagement-field-1">
                      Adresse Email (Identifiant) <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="karim@atlasnet.ma"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                      id="UserManagement-field-1"/>
                  </div>

                  <div>
                    <label className="block text-[var(--text-secondary)] font-semibold mb-1" htmlFor="UserManagement-field-2">
                      Téléphone (WhatsApp Dispatch) <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+212 612-345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500/50 transition"
                      id="UserManagement-field-2"/>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <p className="block text-[var(--text-secondary)] font-semibold mb-1.5" >
                    Rôle & Niveau d&apos;Accès <span className="text-[var(--error)]">*</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'technician' })}
                      className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                        formData.role === 'technician'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-[var(--success)] shadow-md shadow-black/40'
                          : 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border)]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1 text-[var(--text)]">
                        <Wrench className="w-3.5 h-3.5 text-[var(--success)]" />
                        <span className="text-sm">Technicien</span>
                      </div>
                      <p className="text-[12px] text-[var(--muted)] leading-tight">
                        Accès strict à ses interventions sur mobile.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'field_lead' })}
                      className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                        formData.role === 'field_lead'
                          ? 'bg-amber-500/15 border-amber-500/40 text-[var(--warning)] shadow-md shadow-black/40'
                          : 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border)]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1 text-[var(--text)]">
                        <Compass className="w-3.5 h-3.5 text-[var(--warning)]" />
                        <span className="text-sm">Field Lead</span>
                      </div>
                      <p className="text-[12px] text-[var(--muted)] leading-tight">
                        Chef d&apos;équipe terrain et dispatch tâches.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'admin' })}
                      className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                        formData.role === 'admin'
                          ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--primary)] shadow-md shadow-black/40'
                          : 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border)]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1 text-[var(--text)]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--warning)]" />
                        <span className="text-sm">Admin NOC</span>
                      </div>
                      <p className="text-[12px] text-[var(--muted)] leading-tight">
                        Accès total : abonnés, trésorerie et équipe.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Specialty (for technicians and field leads) */}
                {formData.role !== 'admin' && (
                  <div>
                    <label className="block text-[var(--text-secondary)] font-semibold mb-1" htmlFor="UserManagement-field-4">
                      Spécialité Technique
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-[var(--text)] focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                      id="UserManagement-field-4" >
                      <option value="Antennes Ubiquiti & Alignement RF">
                        Antennes Ubiquiti & Alignement RF (-60 dBm)
                      </option>
                      <option value="Câblage Toiture, Pylônes & PoE">
                        Câblage Toiture, Pylônes & PoE
                      </option>
                      <option value="Configuration Routeurs & Box Wi-Fi (PPPoE)">
                        Configuration Routeurs & Box Wi-Fi (PPPoE)
                      </option>
                      <option value="Dépannage Général & Diagnostic Client">
                        Dépannage Général & Diagnostic Client
                      </option>
                    </select>
                  </div>
                )}

                {/* Password with generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[var(--text-secondary)] font-semibold" htmlFor="UserManagement-field-5">
                      Mot de Passe Initial <span className="text-[var(--error)]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, password: handleGeneratePassword() }))}
                      className="text-[12px] text-[var(--warning)] hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Générer un mot de passe fort</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl pl-3.5 pr-10 py-2.5 text-[var(--text)] font-mono focus:outline-none focus:border-amber-500/50 transition"
                      id="UserManagement-field-5"/>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                     aria-label="Afficher ou masquer le mot de passe">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[12px] text-[var(--muted)] mt-1">
                    Le mot de passe pourra être transmis par WhatsApp ou SMS au collaborateur.
                  </p>
                </div>
              </div>

              {/* Sticky Modal Actions */}
              <div className="p-4 sm:p-5 bg-[var(--surface-muted)]/95 backdrop-blur-md border-t border-[var(--border)] flex justify-end gap-2.5 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition cursor-pointer text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/15 transition active:scale-95 cursor-pointer flex items-center gap-2 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Créer le Compte</span>
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      )}

      {/* EDIT STAFF MODAL */}
      {userToEdit && (
        <Dialog onClose={() => setUserToEdit(null)} label="User Management">
          <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-none sm:rounded-2xl max-w-lg w-full h-full sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-4 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[var(--border)] shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--accent-border)]">
                  <Edit2 className="w-5 h-5 text-[var(--warning)]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text)]">
                    Modifier les Informations du Compte
                  </h3>
                  <p className="text-sm text-[var(--muted)]">{userToEdit.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToEdit(null)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1.5 cursor-pointer rounded-lg hover:bg-[var(--surface-muted)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 min-h-0 overflow-hidden flex flex-col text-sm">
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1" htmlFor="UserManagement-field-6">
                    Nom Complet <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-[var(--text)] focus:outline-none focus:border-amber-500/50 transition"
                    id="UserManagement-field-6"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--text-secondary)] font-semibold mb-1" htmlFor="UserManagement-field-7">
                      Adresse Email <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-[var(--text)] focus:outline-none focus:border-amber-500/50 transition"
                      id="UserManagement-field-7"/>
                  </div>

                  <div>
                    <label className="block text-[var(--text-secondary)] font-semibold mb-1" htmlFor="UserManagement-field-8">
                      Téléphone (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-[var(--text)] focus:outline-none focus:border-amber-500/50 transition"
                      id="UserManagement-field-8"/>
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1" htmlFor="UserManagement-field-9">
                    Rôle & Niveau d&apos;Accès <span className="text-[var(--error)]">*</span>
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as Role })}
                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-[var(--text)] focus:outline-none focus:border-amber-500/50 transition cursor-pointer"
                    id="UserManagement-field-9">
                    <option value="technician">Technicien Terrain (/technician)</option>
                    <option value="field_lead">Chef d&apos;Équipe / Field Lead (/technician)</option>
                    <option value="admin">Administrateur NOC (Accès Total /)</option>
                  </select>
                </div>

                {editFormData.role !== 'admin' && (
                  <div>
                    <label className="block text-[var(--text-secondary)] font-semibold mb-1" htmlFor="UserManagement-field-10">
                      Spécialité Technique
                    </label>
                    <input
                      type="text"
                      value={editFormData.specialty}
                      onChange={(e) => setEditFormData({ ...editFormData, specialty: e.target.value })}
                      placeholder="Ex: Antennes Ubiquiti, Câblage Toiture..."
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 text-[var(--text)] focus:outline-none focus:border-amber-500/50 transition"
                      id="UserManagement-field-10"/>
                  </div>
                )}
              </div>

              {/* Sticky Modal Actions */}
              <div className="p-4 sm:p-5 bg-[var(--surface-muted)]/95 backdrop-blur-md border-t border-[var(--border)] flex justify-end gap-2.5 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition cursor-pointer text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/15 transition cursor-pointer flex items-center gap-2 text-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      )}

      {/* RESET PASSWORD MODAL */}
      {userToResetPassword && (
        <Dialog onClose={() => setUserToResetPassword(null)} label="User Management">
          <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-none sm:rounded-2xl max-w-sm w-full h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-4 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[var(--border)] shrink-0 flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-[var(--warning)] border border-amber-500/20">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[var(--text)]">Changer le Mot de Passe</h3>
                <p className="text-sm text-[var(--muted)] truncate">{userToResetPassword.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setUserToResetPassword(null)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1.5 cursor-pointer rounded-lg hover:bg-[var(--surface-muted)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="p-4 sm:p-5 flex flex-col justify-between text-sm space-y-4">
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[var(--text-secondary)] font-semibold" htmlFor="UserManagement-field-11">
                      Nouveau Mot de Passe <span className="text-[var(--error)]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewPasswordValue(handleGeneratePassword())}
                      className="text-[12px] text-[var(--warning)] hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Générer</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showResetPasswordInput ? 'text' : 'password'}
                      required
                      value={newPasswordValue}
                      onChange={(e) => setNewPasswordValue(e.target.value)}
                      className="w-full bg-[var(--surface-muted)] border border-[var(--border)]/70 rounded-xl pl-3.5 pr-10 py-2.5 text-[var(--text)] font-mono focus:outline-none focus:border-amber-500/50 transition"
                      id="UserManagement-field-11"/>
                    <button
                      type="button"
                      onClick={() => setShowResetPasswordInput(!showResetPasswordInput)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                     aria-label="Afficher ou masquer le mot de passe">
                      {showResetPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[12px] text-[var(--muted)] mt-1">
                    Le nouveau mot de passe sera automatiquement copié dans le presse-papier pour WhatsApp.
                  </p>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setUserToResetPassword(null)}
                  className="px-4 py-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition cursor-pointer text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/15 transition cursor-pointer flex items-center gap-1.5 text-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer & Copier</span>
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      )}

      {/* CONFIRM DELETE MODAL */}
      {userToDelete && (
        <Dialog onClose={() => setUserToDelete(null)} label="User Management">
          <div className="bg-[var(--surface)] border border-[var(--border)]/70 rounded-none sm:rounded-2xl max-w-sm w-full h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-4 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[var(--border)] shrink-0 flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-[var(--error)] border border-rose-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[var(--text)]">Supprimer ce Compte ?</h3>
                <p className="text-sm text-[var(--muted)] truncate">{userToDelete.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1.5 cursor-pointer rounded-lg hover:bg-[var(--surface-muted)]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 flex flex-col justify-between text-sm space-y-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement le compte{' '}
                <strong className="text-[var(--text)]">{userToDelete.email}</strong> ? Cette action
                est irréversible.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition cursor-pointer text-sm"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-950 transition cursor-pointer text-sm"
                >
                  Confirmer la suppression
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
