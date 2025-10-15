'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'; // 1. CORRECCIÓN: Importar el cliente correcto

interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  provider: string
  created_at: string
}

export function UserProfileButton({ user }: { user: User | null }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient() // 2. CORRECCIÓN: Usar la nueva función

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!user) {
    return null
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'professor': return 'Profesor'
      case 'student': return 'Estudiante'
      default: return role
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 rounded-full hover:bg-muted/50 p-1 transition-colors"
      >
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.full_name || 'User'}
            width={36}
            height={36}
            className="rounded-full"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-gray-900">
            {user.full_name || user.email.split('@')[0]}
          </p>
          <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
        </div>
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <p className="font-semibold text-gray-900">
                {user.full_name || 'Usuario'}
              </p>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  router.push('/dashboard')
                  setIsDropdownOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-gray-700">Dashboard</span>
              </button>

              <button
                onClick={() => {
                  router.push('/profile')
                  setIsDropdownOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-gray-700">Mi Perfil</span>
              </button>

              <hr className="my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-red-50 transition-colors text-red-600"
              >
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}