import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    // Intercambia el código por una sesión
    const { data: { session }, error: sessionError } = await (await supabase).auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Error exchanging code for session:', sessionError.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Si la sesión se obtiene correctamente, procedemos a verificar/crear el perfil
    if (session?.user) {
      // 1. Verificamos si el usuario ya existe en nuestra tabla 'public.users'
      const { data: existingUser } = await (await supabase)
        .from('users')
        .select('id')
        .eq('id', session.user.id) // Buscamos por el ID de la sesión
        .single();

      // 2. Si no existe, lo creamos
      if (!existingUser) {
        const { error: insertError } = await (await supabase)
          .from('users')
          .insert({
            id: session.user.id, // <-- Se usa el ID de la sesión para mantener consistencia
            email: session.user.email!,
            full_name: session.user.user_metadata.full_name || session.user.user_metadata.name,
            avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture,
            provider: session.user.app_metadata.provider || 'google',
            role: 'student', // Rol por defecto para nuevos registros
          });
        
        if (insertError) {
            console.error('Error creating user profile in public.users:', insertError.message);
            // Aunque falle la creación del perfil, la sesión es válida.
            // Podríamos redirigir a una página de error de perfil, pero por ahora lo dejamos pasar.
        }
      }
    }

    // 3. Finalmente, redirigimos al dashboard
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Si no hay código, redirigimos a login
  console.error('Auth callback error: No code provided.');
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}