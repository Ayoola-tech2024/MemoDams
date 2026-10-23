"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Logo } from '@/components/logo';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    // If not admin and not on the login page, redirect to login
    if (!isAdmin && pathname !== '/management-console/login') {
      router.replace('/management-console/login');
    }
    // If admin and on the login page, redirect to dashboard
    if (isAdmin && pathname === '/management-console/login') {
        router.replace('/management-console');
    }

  }, [isAdmin, isLoading, router, pathname]);

  if (isLoading && pathname !== '/management-console/login') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }
  
  // Allow login page to render without the full layout
  if (pathname === '/management-console/login') {
    return <>{children}</>;
  }


  return (
    <div className="min-h-screen bg-muted/40">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
                 <div className="flex items-center gap-4">
                    <Logo />
                    <span className="text-lg font-semibold tracking-tighter">Admin</span>
                </div>
            </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
            {children}
        </main>
    </div>
  );
}
