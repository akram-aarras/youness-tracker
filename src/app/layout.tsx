import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Youness WiFi - WISP Manager',
  description: 'Internal Operations, Subscriber Management & Field Technician Dispatch System - Youness WiFi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0F0C14] text-[#F4F0F8] flex flex-col font-sans overflow-x-hidden">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
