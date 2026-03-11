"use client";

import { useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-primary rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-muted rounded"></div>
      </div>
    </div>
  );
}
