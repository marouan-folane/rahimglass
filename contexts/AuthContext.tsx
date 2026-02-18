import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStorage } from '../api';
import { AuthState, Profile } from '../types';

interface AuthContextType extends AuthState {
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string, name: string, phone: string) => Promise<{ error: any }>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  // On mount: restore session from stored JWT
  useEffect(() => {
    const restore = async () => {
      const token = tokenStorage.get();
      if (!token) {
        setState({ user: null, profile: null, loading: false });
        return;
      }
      try {
        const { user, profile } = await api.auth.me();
        setState({ user, profile, loading: false });
      } catch {
        // Token expired or invalid — clear it
        tokenStorage.clear();
        setState({ user: null, profile: null, loading: false });
      }
    };
    restore();
  }, []);

  const signIn = async (email: string, pass: string): Promise<{ error: any }> => {
    try {
      const { token, user, profile } = await api.auth.login(email, pass);
      tokenStorage.set(token);
      setState({ user, profile, loading: false });
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Échec de la connexion' } };
    }
  };

  const signUp = async (email: string, pass: string, name: string, phone: string): Promise<{ error: any }> => {
    try {
      const { token, user, profile } = await api.auth.register(email, pass, name, phone);
      tokenStorage.set(token);
      setState({ user, profile, loading: false });
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message || 'Échec de l\'inscription' } };
    }
  };

  const signOut = () => {
    tokenStorage.clear();
    setState({ user: null, profile: null, loading: false });
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    try {
      const { user, profile } = await api.auth.me();
      setState(prev => ({ ...prev, user, profile }));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};