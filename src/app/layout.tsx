import type { Metadata } from 'next';
import { Geist, Geist_Mono, Cairo } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { ThemeProvider } from '@/components/ThemeProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F4F5F7] dark:bg-[#0F0C14] text-slate-900 dark:text-[#F4F0F8] flex flex-col font-sans overflow-x-hidden transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <StoreProvider>{children}</StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
