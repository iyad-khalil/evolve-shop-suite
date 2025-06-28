
import React, { createContext, useContext, useMemo } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

const AuthContext = createContext<ReturnType<typeof useAuthHook> | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthHook();
  
  // Memoize la valeur du contexte pour éviter les re-renders inutiles
  const contextValue = useMemo(() => auth, [
    auth.user,
    auth.profile,
    auth.session,
    auth.loading,
    auth.signUp,
    auth.signIn,
    auth.signOut
  ]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
