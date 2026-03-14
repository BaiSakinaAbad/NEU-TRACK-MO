import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-context';
import { AppLayout } from '@/components/app-layout';
import { FirebaseClientProvider } from '@/firebase';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Track Mo - University MOA Monitoring System',
  description: 'Track and manage university memorandum of agreements with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthProvider>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            }>
              <AppLayout>{children}</AppLayout>
            </Suspense>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
