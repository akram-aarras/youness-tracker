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

// Modals
import RegisterClientModal from '@/components/Modals/RegisterClientModal';
import RecordPaymentModal from '@/components/Modals/RecordPaymentModal';
import CreateTicketModal from '@/components/Modals/CreateTicketModal';
import ClientDetailModal from '@/components/Modals/ClientDetailModal';
import WhatsAppPreviewModal from '@/components/Modals/WhatsAppPreviewModal';

export default function HomePage() {
  const { currentUser, isHydrated, clients } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'tickets'>('dashboard');

  // Modal States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [paymentModalClientId, setPaymentModalClientId] = useState<string | null>(null);
  const [ticketModalClientId, setTicketModalClientId] = useState<string | null>(null);
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<Client | null>(null);
  const [selectedClientForWhatsApp, setSelectedClientForWhatsApp] = useState<Client | null>(null);

  // Prevent flash during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400 font-mono">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-2" />
        Authenticating Secure NOC Gateway...
      </div>
    );
  }

  // Not logged in -> Show Login Screen directly (no public marketing pages)
  if (!currentUser) {
    return <LoginScreen />;
  }

  // If user logged in as technician, show technician task runner view
  if (currentUser.role === 'technician') {
    return <TechnicianView />;
  }

  // Owner / Admin NOC View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onOpenRegisterModal={() => setShowRegisterModal(true)}
            onOpenPaymentModal={(clientId) =>
              setPaymentModalClientId(clientId ?? '')
            }
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
          onClose={() => setPaymentModalClientId(null)}
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
