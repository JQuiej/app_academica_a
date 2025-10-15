'use server'

import { createClient } from '@/lib/supabase/server'; // Se mantiene solo esta importación
import { revalidatePath } from 'next/cache'

// Acción para CREAR una nueva materia
export async function createMateria(formData: FormData) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser(); // Se corrige el doble await
  if (!user) {
    return { error: 'Debes iniciar sesión para crear una materia.' };
  }

  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const ciclo_id = formData.get('ciclo_id') as string

  if (!name || !ciclo_id) {
    return { error: 'El nombre y el ID del ciclo son requeridos.' }
  }

  const { error } = await supabase // Se corrige el doble await
    .from('materias')
    .insert({
      name,
      code,
      ciclo_id,
      user_id: user.id
    })

  if (error) {
    console.error('Error creating materia:', error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/ciclos/${ciclo_id}`)
  return { success: true }
}

// Acción para ACTUALIZAR una materia
export async function updateMateria(formData: FormData) {
  const supabase = createClient(); // Se añade la creación del cliente
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const ciclo_id = formData.get('ciclo_id') as string

  const { error } = await supabase
    .from('materias')
    .update({
      name: name,
      code: code,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating materia:', error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/ciclos/${ciclo_id}`)
  return { success: true }
}

// Acción para ELIMINAR una materia
export async function deleteMateria(id: string, ciclo_id: string) {
  const supabase = createClient(); // Se añade la creación del cliente
  const { error } = await supabase
    .from('materias')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting materia:', error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/ciclos/${ciclo_id}`)
  return { success: true }
}