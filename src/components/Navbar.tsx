'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { LayoutDashboard, Users, Ticket, ShieldCheck, Search, Settings2, Wifi, WifiOff, Smartphone, CreditCard, Download, LogOut, RotateCcw, X, ArrowUpRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import Dialog from './ui/Dialog';

type Tab = 'dashboard' | 'clients' | 'tickets' | 'team';
interface Props {
  activeTab?: Tab;
  setActiveTab?: (tab: Tab) => void;
  onOpenPaymentModal?: () => void;
}

export default function Navbar({ activeTab = 'dashboard', setActiveTab, onOpenPaymentModal }: Props) {
  const { currentUser, switchRole, logout, resetDemoData, tickets, technicians, t, language, exportDataAsJSON, isOnline, isSyncing } = useStore();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const text = (fr: string, en: string, ar: string) => language === 'ar' ? ar : language === 'en' ? en : fr;
  const items = [
    { id: 'dashboard' as const, label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'clients' as const, label: t('nav_clients'), icon: Users },
    { id: 'tickets' as const, label: t('nav_tickets'), icon: Ticket },
    { id: 'team' as const, label: t('nav_team'), icon: ShieldCheck },
  ];
  const openTickets = tickets.filter(ticket => ticket.status !== 'resolved').length;
  const pendingSearch = React.useRef(false);
  const search = React.useCallback(() => {
    const input = document.getElementById('client-directory-search-input') as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.select();
    } else {
      pendingSearch.current = true;
      setActiveTab?.('clients');
    }
  }, [setActiveTab]);
  useEffect(() => {
    if (activeTab !== 'clients' || !pendingSearch.current) return;
    // Focus after React commits the directory, even when rendering spans frames.
    const input = document.getElementById('client-directory-search-input') as HTMLInputElement | null;
    input?.focus();
    input?.select();
    pendingSearch.current = false;
  }, [activeTab]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      // Keep global shortcuts from switching the inert workspace behind a modal.
      if (event.defaultPrevented || document.querySelector('dialog[open]')) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        search();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [search]);

  const navigation = (className: string) => (
    <nav className={className} aria-label={text('Navigation principale', 'Main navigation', 'التنقل الرئيسي')}>
      {items.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" aria-current={activeTab === id ? 'page' : undefined}
          className={`nav-item ${activeTab === id ? 'is-active' : ''}`}
          onClick={() => setActiveTab?.(id)}>
          <Icon size={19} aria-hidden="true" />
          <span>{label}</span>
          {id === 'tickets' && openTickets > 0 && <span className="nav-count">{openTickets}</span>}
        </button>
      ))}
    </nav>
  );
  const downloadBackup = () => {
    const url = URL.createObjectURL(new Blob([exportDataAsJSON()], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `youness-wifi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const brand = <Link href="/" className="brand"><span className="brand-mark"><Wifi size={23} /></span><span>Youness <strong>WiFi</strong><small>{text('Espace opérations', 'Operations workspace', 'فضاء العمليات')}</small></span></Link>;

  return <>
    <a className="skip-link" href="#main-content">{text('Aller au contenu', 'Skip to content', 'انتقل إلى المحتوى')}</a>
    <aside className="app-sidebar">
      {brand}
      <div className="sidebar-label">{text('VOTRE ESPACE', 'YOUR WORKSPACE', 'فضاء العمل')}</div>
      {navigation('sidebar-nav')}
      <div className="sidebar-bottom">
        <Link className="field-link" href="/technician"><Smartphone size={18} /><span>{t('nav_fieldtech')}</span><ArrowUpRight size={16} /></Link>
        <div className="sidebar-context"><span className="status-dot" /><div><strong>Youness WiFi</strong><small>Tétouan, Maroc</small></div></div>
        <button type="button" className="account-button" onClick={() => setSettingsOpen(true)}><span className="avatar">{currentUser?.name.charAt(0)}</span><span><strong>{currentUser?.name.split(' (')[0]}</strong><small>{text('Administrateur', 'Administrator', 'المسؤول')}</small></span><Settings2 size={17} /></button>
      </div>
    </aside>
    <header className="app-header">
      <div className="toolbar">
        <div className="toolbar-brand">{brand}</div>
        <div className="workspace-breadcrumb"><span>{text('Opérations', 'Operations', 'العمليات')}</span><span>/</span><strong>{items.find(item => item.id === activeTab)?.label}</strong></div>
        <div className="toolbar-actions">
          <span className={`connection-state ${isOnline ? '' : 'is-offline'}`} role="status">{isOnline ? <span className="status-dot" /> : <WifiOff size={14} />}<span>{!isOnline ? text('Hors ligne', 'Offline', 'غير متصل') : isSyncing ? text('Synchronisation…', 'Syncing…', 'جارٍ المزامنة…') : text('Connecté', 'Connected', 'متصل')}</span></span>
          <button type="button" className="search-trigger" onClick={search} aria-label={t('search')}><Search size={17} /><span>{t('search')}</span><kbd>Ctrl K</kbd></button>
          <div className="toolbar-language"><LanguageSwitcher compact /></div>
          <ThemeToggle />
          <button type="button" className="icon-button" onClick={() => setSettingsOpen(true)} aria-label={t('nav_theme_preferences')}><Settings2 size={19} /></button>
        </div>
      </div>
      {navigation('tablet-nav')}
    </header>
    {navigation('mobile-nav')}
    {settingsOpen && <Dialog onClose={() => setSettingsOpen(false)} label={t('nav_theme_preferences')} className="settings-dialog">
      <div className="settings-panel">
        <div className="dialog-heading"><div><p className="eyebrow">Youness WiFi</p><h2>{text('Votre espace', 'Your workspace', 'فضاء العمل')}</h2></div><button type="button" className="icon-button" onClick={() => setSettingsOpen(false)} aria-label={t('close')}><X size={20} /></button></div>
        <div className="settings-row"><span>{t('nav_display_language')}</span><LanguageSwitcher /></div>
        <div className="settings-row"><span>{t('nav_theme_preferences')}</span><ThemeToggle showLabel /></div>
        {onOpenPaymentModal && <button type="button" className="settings-action" onClick={() => { setSettingsOpen(false); onOpenPaymentModal(); }}><CreditCard size={18} />{t('dash_record_payment')}</button>}
        <Link href="/technician" className="settings-action"><Smartphone size={18} />{t('nav_fieldtech')}<ArrowUpRight size={16} /></Link>
        {currentUser?.role === 'admin' && <button type="button" className="settings-action" onClick={downloadBackup}><Download size={18} />{t('nav_backup_desc')}<span className="muted">JSON</span></button>}
        <details className="demo-settings"><summary>{t('nav_quick_demo_switch')}</summary><div className="demo-options">
          <button type="button" className="settings-action" onClick={() => { switchRole('admin'); setSettingsOpen(false); router.push('/'); }}>Youness · {text('Administrateur', 'Administrator', 'المسؤول')}</button>
          {technicians.map(tech => <button key={tech.id} type="button" className="settings-action" onClick={() => { switchRole('technician', tech.id); setSettingsOpen(false); router.push('/technician'); }}>{tech.name}</button>)}
          <button type="button" className="settings-action" onClick={() => { setSettingsOpen(false); setResetOpen(true); }}><RotateCcw size={17} />{t('nav_reset_demo')}</button>
        </div></details>
        <button type="button" className="settings-action danger-action" onClick={async () => { await logout(); router.push('/login'); }}><LogOut size={18} />{t('nav_sign_out')}</button>
      </div>
    </Dialog>}
    {resetOpen && <Dialog onClose={() => setResetOpen(false)} label={t('reset_modal_title')}><div className="settings-panel"><h2>{t('reset_modal_title')}</h2><p className="muted">{t('reset_modal_desc')}</p><div className="dialog-actions"><button className="btn-secondary" onClick={() => setResetOpen(false)}>{t('cancel')}</button><button className="btn-primary" onClick={() => { resetDemoData(); setResetOpen(false); }}>{t('reset_modal_confirm')}</button></div></div></Dialog>}
  </>;
}
