import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    console.error('Auth callback error: No code provided.');
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  try {
    const supabase = await createClient();
    
    // Intercambia el código por una sesión
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Error exchanging code for session:', sessionError.message);
      return NextResponse.redirect(`${origin}/login?error=session_failed`);
    }

    if (!session?.user) {
      console.error('No user in session after exchange');
      return NextResponse.redirect(`${origin}/login?error=no_user`);
    }

    // Verificar si el usuario ya existe en nuestra tabla 'users'
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    // Si hay error y NO es "not found", algo salió mal
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing user:', fetchError);
      // Continuar de todas formas, el usuario puede iniciar sesión
    }

    // Si no existe, crear el perfil
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata.full_name || 
                     session.user.user_metadata.name || 
                     session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata.avatar_url || 
                      session.user.user_metadata.picture,
          provider: session.user.app_metadata.provider || 'google',
          role: 'student', // Rol por defecto
        });
      
      if (insertError) {
        console.error('Error creating user profile:', insertError.message);
        // No redirigir a error, el usuario puede usar la app sin perfil completo
      }
    }

    // Redirigir al dashboard con éxito
    const response = NextResponse.redirect(`${origin}/dashboard`);
    
    // Forzar revalidación del caché
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;

  } catch (error: any) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(`${origin}/login?error=unexpected`);
  }
}