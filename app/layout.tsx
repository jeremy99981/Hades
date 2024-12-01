import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from './components/Navbar';
import ClientAuthProvider from './components/ClientAuthProvider';
import './globals.css';
import './styles/safe-area.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hadès',
  description: 'Hadès est une application de streaming qui vous permet de trouver facilement sur quelle plateforme regarder vos films et séries préférés.',
  themeColor: '#141414',
  appleWebApp: {
    capable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#141414" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#141414" media="(prefers-color-scheme: light)" />
      </head>
      <body className={inter.className}>
        <ClientAuthProvider>
          <div className="relative min-h-screen bg-[#141414] text-white">
            <Navbar />
            {children}
          </div>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
