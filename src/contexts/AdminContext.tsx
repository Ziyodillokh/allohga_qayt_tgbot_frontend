'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks';

interface AdminContextType {
  isReadOnly: boolean;
  isAdmin: boolean;
  isModerator: boolean;
}

const AdminContext = createContext<AdminContextType>({
  isReadOnly: true,
  isAdmin: false,
  isModerator: false,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';
  const isModerator = user?.role === 'MODERATOR';
  const isReadOnly = !isAdmin; // MODERATOR va boshqalar faqat o'qiy oladi

  return (
    <AdminContext.Provider value={{ isReadOnly, isAdmin, isModerator }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  return useContext(AdminContext);
}
