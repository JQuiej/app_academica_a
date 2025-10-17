// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../components/ui/AuthProvider';
import { Toaster } from '@/components/ui/sonner'; // ⬅️ AGREGAR ESTO

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Gestión Académica',
  description: 'Plataforma de gestión académica con autenticación OAuth',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster /> {/* ⬅️ AGREGAR ESTO */}
      </body>
    </html>
  );
}