'use client';
import React, { useState, Suspense } from 'react';
import { useStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import { Wifi, Users, CreditCard, Wrench, ArrowRight, Eye, EyeOff, LockKeyhole, Loader2, CheckCircle2 } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

function LoginForm() {
  const { login, registerOwner, hasAdminAccount, isHydrated, language } = useStore();
  const text = (fr: string, en: string, ar: string) => language === 'ar' ? ar : language === 'en' ? en : fr;
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  // Mode: 'login' or 'setup_admin'
  const [requestedMode, setMode] = useState<'login' | 'setup_admin'>('login');
  const mode = hasAdminAccount ? requestedMode : 'setup_admin';

  // Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup Admin Form State
  const [setupName, setSetupName] = useState('Youness');
  const [setupEmail, setSetupEmail] = useState('youness@atlasnet.ma');
  const [setupPhone, setSetupPhone] = useState('+212 661-000111');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success && res.user) {
        // Enforce direct browser redirection to guarantee fresh cookie delivery to middleware
        const safeRedirect = redirectParam?.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : null;
        const targetUrl = safeRedirect || (res.user.role === 'admin' ? '/' : '/technician');
        window.location.href = targetUrl;
      } else {
        setError(res.error || 'Identifiant ou mot de passe incorrect.');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur réseau lors de la tentative de connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (setupPassword !== setupConfirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (setupPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerOwner({
        name: setupName,
        email: setupEmail,
        password: setupPassword,
        phone: setupPhone,
      });

      if (res.success && res.user) {
        setSetupSuccess(true);
        setTimeout(() => {
          window.location.assign(new URL('/', window.location.origin).href);
        }, 800);
      } else {
        setError(res.error || "Impossible de créer le compte Administrateur.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement de l'administrateur.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) return <div className="loading-screen" role="status"><div className="loading-bar" />{text('Chargement de votre espace…', 'Loading your workspace…', 'جارٍ تحميل فضاء العمل…')}</div>;
  return <div className="auth-layout">
    <section className="auth-story" aria-label="Youness WiFi">
      <div className="brand"><span className="brand-mark"><Wifi size={24} /></span><span>Youness <strong>WiFi</strong><small>Tétouan, Maroc</small></span></div>
      <div className="auth-story-content">
        <p className="eyebrow" style={{color:'#f5b66d'}}>{text('PLUS PROCHE. MIEUX CONNECTÉ.', 'CLOSER. BETTER CONNECTED.', 'أقرب إليكم. اتصال أفضل.')}</p>
        <h1>{text('Votre réseau.', 'Your network.', 'شبكتك.')}<br /><em>{text('Tout simplement.', 'Simply connected.', 'بكل بساطة.')}</em></h1>
        <p>{text('Les abonnés, les paiements et les interventions de votre équipe, réunis dans un espace clair.', 'Subscribers, payments, and your team’s field work, together in one clear workspace.', 'المشتركون والمدفوعات وتدخلات فريقك، في فضاء واحد واضح.')}</p>
        <div className="auth-features">
          <div className="auth-feature"><Users size={20} />{text('Chaque abonné, à portée de main', 'Every subscriber, within reach', 'كل مشترك في متناول يدك')}</div>
          <div className="auth-feature"><CreditCard size={20} />{text('Des paiements faciles à suivre', 'Payments that are easy to track', 'مدفوعات سهلة التتبع')}</div>
          <div className="auth-feature"><Wrench size={20} />{text('Une équipe terrain bien organisée', 'A field team that stays organized', 'فريق ميداني منظم')}</div>
        </div>
      </div>
      <p className="auth-story-footer">Youness WiFi · {text('Au service de votre connexion.', 'Here for your connection.', 'في خدمة اتصالك.')}</p>
    </section>
    <main className="auth-form-area" id="main-content">
      <div className="auth-preferences"><LanguageSwitcher /><ThemeToggle /></div>
      <div className="auth-card">
        <p className="eyebrow">{text('ESPACE ÉQUIPE', 'TEAM WORKSPACE', 'فضاء الفريق')}</p>
        <h2>{mode === 'login' ? text('Bon retour.', 'Welcome back.', 'مرحباً بعودتك.') : text('Bienvenue chez vous.', 'Make yourself at home.', 'مرحباً بك في فضائك.')}</h2>
        <p className="auth-description">{mode === 'login' ? text('Connectez-vous pour retrouver vos abonnés et vos interventions.', 'Sign in to manage your subscribers and field work.', 'سجّل الدخول لإدارة المشتركين والتدخلات.') : text('Créez le compte administrateur pour démarrer votre espace opérations.', 'Create the administrator account to start your operations workspace.', 'أنشئ حساب المسؤول لبدء إدارة العمليات.')}</p>
        {error && <p className="form-alert" role="alert" id="login-error">{error}</p>}
        {setupSuccess && <p className="form-alert form-success" role="status"><CheckCircle2 size={18} />{text('Compte créé. Ouverture de votre espace…', 'Account created. Opening your workspace…', 'تم إنشاء الحساب. جارٍ فتح فضائك…')}</p>}
        {mode === 'login' ? <form className="auth-form" onSubmit={handleLoginSubmit} aria-busy={isLoading}>
          <div className="auth-field"><label htmlFor="login-identifier">{text('Email ou identifiant', 'Email or username', 'البريد الإلكتروني أو اسم المستخدم')}</label><input id="login-identifier" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="youness@atlasnet.ma" required aria-describedby={error ? 'login-error' : undefined} /></div>
          <div className="auth-field"><label htmlFor="login-password">{text('Mot de passe', 'Password', 'كلمة المرور')}</label><div className="password-field"><input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={text('Votre mot de passe', 'Your password', 'كلمة المرور الخاصة بك')} required /><button type="button" aria-pressed={showPassword} aria-label={text('Afficher ou masquer le mot de passe', 'Show or hide password', 'إظهار أو إخفاء كلمة المرور')} onClick={()=>setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
          <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <><Loader2 size={18} className="animate-spin" />{text('Connexion…', 'Signing in…', 'جارٍ الاتصال…')}</> : <>{text('Se connecter', 'Sign in', 'تسجيل الدخول')}<ArrowRight size={18} className="rtl:rotate-180" /></>}</button>
        </form> : <form className="auth-form" onSubmit={handleSetupAdminSubmit} aria-busy={isLoading}>
          <div className="auth-field"><label htmlFor="setup-name">{text('Nom complet', 'Full name', 'الاسم الكامل')}</label><input id="setup-name" autoComplete="name" value={setupName} onChange={e=>setSetupName(e.target.value)} required /></div>
          <div className="auth-field"><label htmlFor="setup-email">Email</label><input id="setup-email" type="email" autoComplete="email" value={setupEmail} onChange={e=>setSetupEmail(e.target.value)} required /></div>
          <div className="auth-field"><label htmlFor="setup-phone">{text('Téléphone', 'Phone', 'الهاتف')}</label><input id="setup-phone" type="tel" autoComplete="tel" value={setupPhone} onChange={e=>setSetupPhone(e.target.value)} required /></div>
          <div className="auth-field"><label htmlFor="setup-password">{text('Mot de passe · 6 caractères minimum', 'Password · at least 6 characters', 'كلمة المرور · 6 أحرف على الأقل')}</label><div className="password-field"><input id="setup-password" type={showSetupPassword ? 'text' : 'password'} autoComplete="new-password" value={setupPassword} onChange={e=>setSetupPassword(e.target.value)} minLength={6} required /><button type="button" aria-pressed={showSetupPassword} aria-label={text('Afficher ou masquer le mot de passe', 'Show or hide password', 'إظهار أو إخفاء كلمة المرور')} onClick={()=>setShowSetupPassword(!showSetupPassword)}>{showSetupPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
          <div className="auth-field"><label htmlFor="setup-confirm">{text('Confirmer le mot de passe', 'Confirm password', 'تأكيد كلمة المرور')}</label><input id="setup-confirm" type={showSetupPassword ? 'text' : 'password'} autoComplete="new-password" value={setupConfirmPassword} onChange={e=>setSetupConfirmPassword(e.target.value)} required /></div>
          <button type="submit" className="btn-primary" disabled={isLoading || setupSuccess}>{isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />} {text('Créer mon espace', 'Create my workspace', 'إنشاء فضائي')}</button>
          {hasAdminAccount && <button type="button" className="btn-secondary" onClick={()=>setMode('login')}>{text('Retour à la connexion', 'Back to sign in', 'العودة لتسجيل الدخول')}</button>}
        </form>}
        <p className="auth-notice"><LockKeyhole size={14} />{text('Accès réservé à votre équipe.', 'Access reserved for your team.', 'الدخول مخصص لفريقك.')}</p>
        {mode === 'login' && <details className="demo-settings"><summary>{text('Profils de démonstration', 'Demo profiles', 'ملفات تجريبية')}</summary><p className="muted">{text('Préremplir les identifiants de démonstration.', 'Fill in demo credentials.', 'ملء بيانات الدخول التجريبية.')}</p><div className="flex flex-wrap gap-2 mt-3">{['youness','yassine','omar'].map(name=><button key={name} type="button" className="btn-secondary" onClick={()=>{setIdentifier(name);setPassword(name === 'youness' ? 'Admin123!' : 'Tech123!');}}>{name}</button>)}</div></details>}
      </div>
    </main>
  </div>;
}

export default function LoginScreen() {
  return <Suspense fallback={<div className="loading-screen" role="status"><div className="loading-bar" />Youness WiFi</div>}><LoginForm /></Suspense>;
}
