'use client';

import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export default function UserProfilePanel() {
  const { user, loading, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await signOut();
  };

  // Si está cargando, mostrar skeleton
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 animate-pulse">
        <div className="w-11 h-11 bg-muted rounded-full"></div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-3 bg-muted rounded w-16"></div>
        </div>
      </div>
    );
  }

  // Si no hay usuario después de cargar, no mostrar nada
  if (!user) {
    return null;
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'professor': return 'Profesor';
      case 'student': return 'Estudiante';
      default: return role;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-muted/50 transition-colors"
      >
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.full_name || 'User'}
            width={44}
            height={44}
            className="rounded-full"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
            {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {user.full_name || user.email?.split('@')[0]}
          </p>
          <p className="text-sm text-muted-foreground truncate">{getRoleLabel(user.role)}</p>
        </div>
      </button>

      {isDropdownOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-background rounded-lg shadow-xl z-20 border">
            <div className="p-4 border-b">
              <p className="font-semibold text-foreground truncate">
                {user.full_name || 'Usuario'}
              </p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="p-2">
              <button
                onClick={() => { 
                  setIsDropdownOpen(false);
                  router.push('/profile'); 
                }}
                className="w-full text-left rounded-lg p-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                Mi Perfil
              </button>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left rounded-lg p-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}