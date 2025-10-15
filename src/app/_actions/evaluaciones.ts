'use server'

import { createClient } from '@/lib/supabase/server'; // 1. Importar la función createClient
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Cambiamos 'weight' por 'punteo'
const evaluacionSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  type: z.enum(['tarea', 'parcial', 'final']),
  date: z.string().min(1, { message: 'La fecha es requerida.' }),
  punteo: z.coerce.number().min(0, 'El punteo no puede ser negativo.'),
  materia_id: z.string().uuid(),
})

export async function createEvaluacion(formData: FormData) {
  const supabase = createClient(); // 2. Crear una instancia del cliente aquí
  const validatedFields = evaluacionSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!validatedFields.success) return { error: 'Datos inválidos.' }

  const { name, type, date, punteo, materia_id } = validatedFields.data
  const { error } = await supabase.from('evaluaciones').insert({ name, type, date, punteo, materia_id })

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/materias/${materia_id}`)
  return { success: true }
}

export async function updateEvaluacion(formData: FormData) {
  const supabase = createClient(); // 2. Crear una instancia del cliente aquí
  const id = formData.get('id') as string
  const validatedFields = evaluacionSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!validatedFields.success) return { error: 'Datos inválidos.' }

  const { name, type, date, punteo, materia_id } = validatedFields.data
  const { error } = await supabase.from('evaluaciones').update({ name, type, date, punteo }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/materias/${materia_id}`)
  return { success: true }
}

export async function deleteEvaluacion(id: string, materia_id: string) {
  const supabase = createClient(); // 2. Crear una instancia del cliente aquí
  const { error } = await supabase.from('evaluaciones').delete().eq('id', id)
  if (error) return { error: error.message }
  
  revalidatePath(`/dashboard/materias/${materia_id}`)
  return { success: true }
}