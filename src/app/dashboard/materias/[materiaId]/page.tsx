import { createClient } from '@/lib/supabase/server';
import { MateriaView } from './MateriaView';

export const dynamic = 'force-dynamic';

export default async function MateriaDetailPage({
  params
}: {
  // 1. CORRECCIÓN: Se define `params` como una Promesa
  params: Promise<{ materiaId: string }>;
}) {
  const supabase = createClient();
  
  // 2. CORRECCIÓN: Se "espera" (await) la promesa para obtener los parámetros
  const resolvedParams = await params;
  const materiaId = resolvedParams.materiaId;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8">Necesitas iniciar sesión para ver esta página.</div>;
  }

  // Se usa el `materiaId` resuelto en la consulta
  const { data: materia, error: materiaError } = await supabase
    .from('materias')
    .select(`*, ciclos ( * )`)
    .eq('id', materiaId)
    .eq('user_id', user.id)
    .single();

  if (materiaError || !materia) {
    return <div className="p-8">Materia no encontrada o no tienes permiso para verla.</div>;
  }

  const { data: evaluacionesData } = await supabase.from('evaluaciones').select(`*`).eq('materia_id', materiaId).order('date');
  const evaluacionIds = evaluacionesData?.map(ev => ev.id) || [];
  const { data: calificacionesData } = await supabase.from('calificaciones').select('evaluacion_id, score').in('evaluacion_id', evaluacionIds);
  
  const calificacionesMap = new Map(calificacionesData?.map(cal => [cal.evaluacion_id, { score: cal.score }]));
  const evaluaciones = evaluacionesData?.map(ev => ({ ...ev, calificaciones: calificacionesMap.has(ev.id) ? [calificacionesMap.get(ev.id)!] : null })) || [];
  
  const ciclo = materia.ciclos;
  
  let puntosGanados = 0;
  let punteoTotalAsignado = 0;
  let puntosPerdidos = 0;
  const notaParaAprobar = 61;

  evaluaciones?.forEach((evaluacion) => {
    punteoTotalAsignado += evaluacion.punteo;
    const calificacion = evaluacion.calificaciones?.[0];
    if (calificacion && calificacion.score !== null) {
      puntosGanados += calificacion.score;
      puntosPerdidos += evaluacion.punteo - calificacion.score;
    }
  });
  
  const notaMaximaPosible = 100 - puntosPerdidos;
  let mensajeDeEstado = '';
  let colorDeEstado = '';

  if (notaMaximaPosible < notaParaAprobar) {
    mensajeDeEstado = "Ya no es posible alcanzar la nota para aprobar. ¡Enfoca tus esfuerzos en las demás materias!";
    colorDeEstado = 'text-yellow-600';
  } else if (puntosGanados >= 100) {
    mensajeDeEstado = `¡Excelente! ¡Has alcanzado la nota perfecta de 100! 🏆`;
    colorDeEstado = 'text-green-600';
  } else if (puntosGanados >= notaParaAprobar) {
    if (notaMaximaPosible < 100) {
      mensajeDeEstado = `¡Felicidades, has aprobado! 🎉 Tu nota máxima posible es ${notaMaximaPosible.toFixed(2)}.`;
    } else {
      mensajeDeEstado = "¡Felicidades, has aprobado el curso! 🎉 ¡Ahora a por el 100!";
    }
    colorDeEstado = 'text-green-600';
  } else {
    mensajeDeEstado = `Necesitas ${(notaParaAprobar - puntosGanados).toFixed(2)} puntos más para aprobar. ¡Tú puedes!`;
    colorDeEstado = 'text-blue-600';
  }

  const calculos = {
    puntosGanados,
    punteoTotalAsignado,
    puntosPerdidos,
    notaParaAprobar,
    notaMaximaPosible,
    mensajeDeEstado,
    colorDeEstado
  }

 return (
    <MateriaView 
      materia={materia as any} 
      evaluaciones={evaluaciones as any}
      ciclo={ciclo as any}
      calculos={calculos}
    />
  )
}