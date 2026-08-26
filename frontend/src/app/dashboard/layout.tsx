// src/app/dashboard/layout.tsx
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Any page inside the /dashboard folder will now pass through this guard first
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}