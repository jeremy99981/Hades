'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://192.168.1.33:8090');

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, passwordConfirm: string, username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider(props: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const authData = pb.authStore.model;
    if (authData) {
      setIsAuthenticated(true);
      setUser(authData);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      if (authData) {
        setIsAuthenticated(true);
        setUser(authData.record);
        return { success: true };
      }
      return { success: false, error: 'Échec de la connexion' };
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      if (error.response?.data) {
        console.log('Détails de l\'erreur:', error.response.data);
      }
      return {
        success: false,
        error: error.message || 'Échec de la connexion'
      };
    }
  };

  const register = async (email: string, password: string, passwordConfirm: string, username: string) => {
    try {
      if (password.length < 8) {
        return { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
      }

      if (password !== passwordConfirm) {
        return { success: false, error: 'Les mots de passe ne correspondent pas' };
      }

      const data = {
        email,
        password,
        passwordConfirm,
        username,
        name: username,
        emailVisibility: true,
      };

      console.log('Tentative de création d\'utilisateur avec:', { ...data, password: '***' });

      try {
        const record = await pb.collection('users').create(data);
        console.log('Réponse de création:', record);
        
        if (record) {
          console.log('Utilisateur créé avec succès:', { id: record.id, email: record.email });
          // Connexion automatique après l'inscription
          try {
            const authData = await pb.collection('users').authWithPassword(email, password);
            if (authData) {
              setIsAuthenticated(true);
              setUser(authData.record);
            }
          } catch (loginError) {
            console.error('Erreur lors de la connexion après inscription:', loginError);
          }
          return { success: true };
        }
      } catch (createError: any) {
        console.error('Erreur détaillée lors de la création:', createError);
        if (createError.response?.data) {
          console.log('Données de l\'erreur:', JSON.stringify(createError.response.data, null, 2));
          const errorMessages = Object.entries(createError.response.data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          return { success: false, error: errorMessages };
        }
        throw createError;
      }
      
      return { success: false, error: 'Échec de l\'inscription' };
    } catch (error: any) {
      console.error('Erreur d\'inscription complète:', error);
      console.error('Stack trace:', error.stack);
      
      if (error.response) {
        console.log('Réponse d\'erreur complète:', error.response);
      }
      
      return {
        success: false,
        error: typeof error.message === 'object' ? JSON.stringify(error.message) : error.message || 'Échec de l\'inscription'
      };
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    Provider: AuthContext.Provider,
    value: {
      isAuthenticated,
      user,
      login,
      register,
      logout
    },
    children: props.children
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}
