import { createClient } from '@/lib/supabase/server'; // <-- 1. Usa el cliente de servidor
import { CalendarioClient, type Evaluacion } from './CalendarioClient';

export default async function CalendarioPage() {
  const supabase = createClient();

  // 2. Obtenemos el usuario actual
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) {
    // Si no hay usuario, devolvemos el calendario vacío para no causar un error.
    return <CalendarioClient evaluaciones={[]} />;
  }

  // 3. Obtenemos solo las materias que pertenecen al usuario actual.
  const { data: materias } = await (await supabase)
    .from('materias')
    .select('id')
    .eq('user_id', user.id);

  // Si el usuario no tiene materias, no hay nada que mostrar.
  if (!materias || materias.length === 0) {
    return <CalendarioClient evaluaciones={[]} />;
  }

  const materiaIds = materias.map(m => m.id);

  // 4. Ahora sí, obtenemos las evaluaciones que están dentro de las materias del usuario.
  const { data: evaluaciones } = await (await supabase)
    .from('evaluaciones')
    .select(`
      id, name, type, date, punteo,
      materias (id, name, code)
    `)
    .in('materia_id', materiaIds) // <-- ¡El filtro clave!
    .order('date', { ascending: true });

  // Pasamos las evaluaciones (ya filtradas) al componente cliente.
  return <CalendarioClient evaluaciones={(evaluaciones as any as Evaluacion[]) || []} />;
}