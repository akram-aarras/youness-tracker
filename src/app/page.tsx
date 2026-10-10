'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Toast from '@/components/ui/Toast';
import { useStore } from '@/lib/store';
import { Client } from '@/lib/types';
import LoginScreen from '@/components/LoginScreen';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/AdminDashboard';
import ClientDirectory from '@/components/ClientDirectory';
import TicketBoard from '@/components/TicketBoard';
import TechnicianView from '@/components/TechnicianView';
import UserManagement from '@/components/UserManagement';

// Keep lazy modal loading inside a local Suspense boundary. Suspending the
// workspace would hide the trigger and lose keyboard focus before Dialog opens.
const RegisterClientModal = dynamic(() => import('@/components/Modals/RegisterClientModal'), { loading: () => null });
const RecordPaymentModal = dynamic(() => import('@/components/Modals/RecordPaymentModal'), { loading: () => null });
const CreateTicketModal = dynamic(() => import('@/components/Modals/CreateTicketModal'), { loading: () => null });
const ClientDetailModal = dynamic(() => import('@/components/Modals/ClientDetailModal'), { loading: () => null });
const WhatsAppPreviewModal = dynamic(() => import('@/components/Modals/WhatsAppPreviewModal'), { loading: () => null });

export default function HomePage() {
  const { currentUser, isHydrated, clients, language } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'tickets' | 'team'>('dashboard');

  const [feedback, setFeedback] = useState<string | null>(null);
  const closeFeedback = React.useCallback(() => setFeedback(null), []);
  const text = (fr: string, en: string, ar: string) => language === 'ar' ? ar : language === 'en' ? en : fr;

  // Modal States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [paymentModalClientId, setPaymentModalClientId] = useState<string | null>(null);
  const [paymentModalBillingMonth, setPaymentModalBillingMonth] = useState<string | undefined>(undefined);
  const [ticketModalClientId, setTicketModalClientId] = useState<string | null>(null);
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<Client | null>(null);
  const [selectedClientForWhatsApp, setSelectedClientForWhatsApp] = useState<Client | null>(null);

  // Prevent flash during hydration
  if (!isHydrated) {
    return (
      <div className="loading-screen" role="status"><div className="loading-bar" />Youness WiFi</div>
    );
  }

  // Not logged in -> Show Login Screen directly (no public marketing pages)
  if (!currentUser) {
    return <LoginScreen />;
  }

  // If user logged in as technician or field lead, show technician task runner view
  if (currentUser.role === 'technician' || currentUser.role === 'field_lead') {
    return <TechnicianView />;
  }

  // Owner / Admin NOC View
  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPaymentModal={() => setPaymentModalClientId('')}
      />

      <main id="main-content" tabIndex={-1} className="app-content">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onOpenRegisterModal={() => setShowRegisterModal(true)}
            onOpenPaymentModal={(clientId, billingMonth) => {
              setPaymentModalClientId(clientId ?? '');
              setPaymentModalBillingMonth(billingMonth);
            }}
            onOpenTicketModal={(clientId) =>
              setTicketModalClientId(clientId ?? '')
            }
            onOpenWhatsAppModal={(client) => setSelectedClientForWhatsApp(client)}
            onOpenClientDetailModal={(client) => setSelectedClientForDetail(client)}
            onNavigateToClients={() => setActiveTab('clients')}
            onNavigateToTickets={() => setActiveTab('tickets')}
          />
        )}

        {activeTab === 'clients' && (
          <ClientDirectory
            onOpenRegisterModal={() => setShowRegisterModal(true)}
            onOpenPaymentModal={(clientId) =>
              setPaymentModalClientId(clientId ?? '')
            }
            onOpenTicketModal={(clientId) =>
              setTicketModalClientId(clientId ?? '')
            }
            onOpenWhatsAppModal={(client) => setSelectedClientForWhatsApp(client)}
            onOpenClientDetailModal={(client) => setSelectedClientForDetail(client)}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketBoard
            onOpenCreateTicketModal={() => setTicketModalClientId('')}
          />
        )}

        {activeTab === 'team' && <UserManagement />}
      </main>

      {feedback && <Toast message={feedback} onClose={closeFeedback} />}
      {/* MODALS */}
      {showRegisterModal && (
        <RegisterClientModal onSuccess={() => setFeedback(text('Abonné enregistré.', 'Subscriber saved.', 'تم تسجيل المشترك.'))}
          onClose={() => setShowRegisterModal(false)}
        />
      )}

      {paymentModalClientId !== null && (
        <RecordPaymentModal
          initialClientId={paymentModalClientId || undefined}
          initialBillingMonth={paymentModalBillingMonth}
          onClose={() => {
            setPaymentModalClientId(null);
            setPaymentModalBillingMonth(undefined);
          }}
        />
      )}

      {ticketModalClientId !== null && (
        <CreateTicketModal onSuccess={() => setFeedback(text('Ticket créé et assigné.', 'Ticket created and assigned.', 'تم إنشاء التذكرة وتعيين التقني.'))}
          initialClientId={ticketModalClientId || undefined}
          onClose={() => setTicketModalClientId(null)}
        />
      )}

      {selectedClientForDetail && (
        <ClientDetailModal
          client={
            clients.find((c) => c.id === selectedClientForDetail.id) ||
            selectedClientForDetail
          }
          onClose={() => setSelectedClientForDetail(null)}
          onRecordPayment={(clientId) => {
            setSelectedClientForDetail(null);
            setPaymentModalClientId(clientId);
          }}
          onSendWhatsApp={(client) => {
            setSelectedClientForDetail(null);
            setSelectedClientForWhatsApp(client);
          }}
          onCreateTicket={(clientId) => {
            setSelectedClientForDetail(null);
            setTicketModalClientId(clientId);
          }}
        />
      )}

      {selectedClientForWhatsApp && (
        <WhatsAppPreviewModal
          client={
            clients.find((c) => c.id === selectedClientForWhatsApp.id) ||
            selectedClientForWhatsApp
          }
          onClose={() => setSelectedClientForWhatsApp(null)}
        />
      )}
    </div>
  );
}
