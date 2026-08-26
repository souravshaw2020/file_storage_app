'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth'; '@/lib/hooks/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only attempt to redirect if we have finished checking the user's status
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // 1. Show a loader while checking auth status
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading secure environment...</p>
      </div>
    );
  }

  // 2. Prevent a flash of protected content while the router redirects
  if (!user) {
    return null; 
  }

  // 3. Render the protected application
  return <>{children}</>;
}