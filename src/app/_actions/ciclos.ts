'use server'

import { createClient } from '@/lib/supabase/server'; // Importar createClient desde el archivo correcto
import { revalidatePath } from 'next/cache'

// Interfaz para definir la forma de un ciclo, útil para pasar props
export interface Ciclo {
  id: string;
  year: number;
  period: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// Acción para CREAR un nuevo ciclo
export async function createCiclo(formData: FormData) {
  const supabase = createClient(); // Crea el cliente de servidor

  // Obtenemos el usuario actual
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Debes iniciar sesión para crear un ciclo.' };
  }

  const year = formData.get('year') as string;
  const period = formData.get('period') as string;
  const description = formData.get('description') as string;

  const { error } = await supabase
    .from('ciclos')
    .insert({ 
      year: parseInt(year), 
      period, 
      description,
      user_id: user.id // <-- ¡Aquí guardamos el ID del usuario!
    });

  if (error) {
    console.error('Error creating ciclo:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/ciclos');
  return { success: true }; // Devuelve un objeto para manejar la respuesta
}

// Acción para ACTUALIZAR un ciclo existente
export async function updateCiclo(formData: FormData) {
  const supabase = createClient(); // Crea el cliente de servidor
  const id = formData.get('id') as string;
  const year = formData.get('year') as string;
  const period = formData.get('period') as string;
  const description = formData.get('description') as string;

  if (!id) {
    console.error('Error: ID is missing for update');
    return;
  }

  const { error } = await supabase
    .from('ciclos')
    .update({
      year: parseInt(year),
      period,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating ciclo:', error);
    return;
  }

  revalidatePath('/dashboard/ciclos');
}

export async function deleteCiclo(id: string) {
  const supabase = createClient(); // Crea el cliente de servidor
  const { error } = await supabase.from('ciclos').delete().eq('id', id);

  if (error) {
    console.error('Error deleting ciclo:', error);
    return { error: 'No se pudo eliminar el ciclo. Es posible que tenga materias asociadas.' };
  }
  
  revalidatePath('/dashboard/ciclos');
  return { success: true };
}