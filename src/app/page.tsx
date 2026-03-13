'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once we are sure about the auth state
    if (!isLoading) {
      if (user) {
        if (user.role === 'STUDENT') {
          router.push('/moas');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-xl animate-bounce" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-primary animate-pulse tracking-widest uppercase">Initializing Session</p>
          <p className="text-xs text-muted-foreground">Verifying institutional credentials...</p>
        </div>
      </div>
    </div>
  );
}
