'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Interfaz para nuestro usuario combinado (auth + perfil de la tabla 'users')
interface User extends SupabaseUser {
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'professor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Si hay una sesión de Supabase, procedemos a buscar el perfil en nuestra tabla 'users'
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // Combinamos la información de la sesión (auth.users) con nuestro perfil (public.users)
          setUser({ ...session.user, ...profile } as User);
        } else {
          // Si no hay sesión, el usuario es nulo
          setUser(null);
        }
        // Marcamos la carga como finalizada solo después de haber intentado obtener la sesión y el perfil
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    // router.refresh() le indica a Next.js que recargue la vista desde el servidor.
    // El middleware se encargará de redirigir a /login al no encontrar una sesión.
    router.refresh();
  };

  const value = {
    user,
    loading,
    signOut,
    supabase,
  };

  // ✅ CORRECCIÓN IMPORTANTE: Devolvemos {children} directamente.
  // No bloqueamos el renderizado. Los componentes hijos usarán el estado 'loading'
  // para decidir si muestran un esqueleto de carga o los datos.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}