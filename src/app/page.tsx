'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Client } from '@/lib/types';
import LoginScreen from '@/components/LoginScreen';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/AdminDashboard';
import ClientDirectory from '@/components/ClientDirectory';
import TicketBoard from '@/components/TicketBoard';
import TechnicianView from '@/components/TechnicianView';
import UserManagement from '@/components/UserManagement';

// Modals
import RegisterClientModal from '@/components/Modals/RegisterClientModal';
import RecordPaymentModal from '@/components/Modals/RecordPaymentModal';
import CreateTicketModal from '@/components/Modals/CreateTicketModal';
import ClientDetailModal from '@/components/Modals/ClientDetailModal';
import WhatsAppPreviewModal from '@/components/Modals/WhatsAppPreviewModal';

export default function HomePage() {
  const { currentUser, isHydrated, clients } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'tickets' | 'team'>('dashboard');

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
      <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0F0C14] flex items-center justify-center text-xs text-slate-500 dark:text-[#958B9F] font-mono">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping mr-2" />
        Authenticating Secure NOC Gateway...
      </div>
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
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0F0C14] text-slate-900 dark:text-[#F4F0F8] flex flex-col relative overflow-x-hidden transition-colors">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPaymentModal={() => setPaymentModalClientId('')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* MODALS */}
      {showRegisterModal && (
        <RegisterClientModal
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
        <CreateTicketModal
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
