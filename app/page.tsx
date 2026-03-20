'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) router.replace(user ? '/dashboard' : '/login');
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-100">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium text-sm">Loading…</p>
    </div>
  );
}
