'use server'

import { createClient } from '@/lib/supabase/server'; // 1. Importar la función createClient
import { revalidatePath } from 'next/cache'

export async function upsertCalificacion(formData: FormData) {
  const supabase = createClient(); // 2. Crear una instancia del cliente aquí
  const evaluacion_id = formData.get('evaluacion_id') as string;
  const materia_id = formData.get('materia_id') as string;
  const scoreStr = formData.get('score') as string;
  const score = parseFloat(scoreStr);

  // --- NUEVA VALIDACIÓN ---
  const { data: evaluacion, error: evError } = await supabase
    .from('evaluaciones')
    .select('punteo')
    .eq('id', evaluacion_id)
    .single();

  if (evError || !evaluacion) return { error: 'La evaluación no fue encontrada.' };
  if (score > evaluacion.punteo) return { error: `La nota no puede ser mayor a ${evaluacion.punteo}.` };
  if (score < 0) return { error: `La nota no puede ser negativa.` };
  // -------------------------

  const { error } = await supabase
    .from('calificaciones')
    .upsert({ evaluacion_id, score }, { onConflict: 'evaluacion_id' });

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/materias/${materia_id}`);
  return { success: true };
}