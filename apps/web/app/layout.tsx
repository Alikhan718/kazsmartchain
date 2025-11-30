import './globals.css';
import React from 'react';
import { Providers } from './providers';
import { ConditionalLayout } from './conditional-layout';

export const metadata = {
  title: 'KazSmartChain | Blockchain Platform',
  description: 'Казахстанская корпоративная блокчейн платформа',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
