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
          req.cookies.set({ name, value, ...options })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
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

  // Refrescar la sesión si ha expirado
  const { data: { session }, error } = await supabase.auth.getSession()

  // Si hay error al obtener la sesión, intentar refrescarla
  if (error) {
    console.error('Error getting session in middleware:', error)
  }

  // Si estamos en la raíz, redirigir según el estado de sesión
  if (req.nextUrl.pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    } else {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  const protectedPaths = ['/dashboard', '/profile']
  const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Si no hay sesión y se intenta acceder a ruta protegida
  if (!session && isProtected) {
    const redirectUrl = new URL('/login', req.url)
    // Guardar la URL original para redirigir después del login
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay sesión y se intenta acceder a login/register
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Agregar headers para prevenir caché en rutas protegidas
  if (isProtected) {
    res.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, sitemap.xml, robots.txt
     * - archivos estáticos (*.svg, *.png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}