import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Si `set` se llama desde un Server Component, se lanzará un error.
          // El middleware puede ignorar esto de forma segura porque
          // refrescará las cookies en la respuesta final.
          req.cookies.set({ name, value, ...options })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // Lo mismo que `set`.
          req.cookies.set({ name, value: '', ...options })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Esta línea es crucial para refrescar la sesión si ha expirado
  const { data: { session } } = await supabase.auth.getSession()

  if (req.nextUrl.pathname === '/') {
    if (session) {
      // Si hay sesión, llévalo al dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } else {
      // Si no hay sesión, llévalo al login
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  const protectedPaths = ['/dashboard', '/profile']
  const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Si el usuario no está autenticado y пытается acceder a una ruta protegida,
  // redirigirlo a la página de login.
  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Si el usuario está autenticado y пытается acceder a login o register,
  // redirigirlo al dashboard.
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de petición excepto las que empiezan por:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (archivo de favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}