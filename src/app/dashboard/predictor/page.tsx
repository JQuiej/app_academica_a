import { createClient } from "../../../lib/supabase/server";
import { PredictorClient } from "./PredictorClient";

export const dynamic = "force-dynamic";

// Esta función para procesar los datos es correcta, no necesita cambios.
function procesarDatosParaPredictor(materias: any[], evaluaciones: any[], calificaciones: any[]) {
  const calificacionesMap = new Map(calificaciones.map(c => [c.evaluacion_id, c.score]));
  const evaluacionesPorMateria = new Map<string, any[]>();

  evaluaciones.forEach(e => {
    if (!evaluacionesPorMateria.has(e.materia_id)) evaluacionesPorMateria.set(e.materia_id, []);
    evaluacionesPorMateria.get(e.materia_id)?.push(e);
  });

  return materias.map(materia => {
    let puntosGanados = 0, punteoAsignado = 0, puntosPerdidos = 0;
    let evaluacionesPendientes: Array<{ id: string; name: string; punteo: number }> = [];

    const evsDeMateria = evaluacionesPorMateria.get(materia.id) || [];
    evsDeMateria.forEach(ev => {
      punteoAsignado += ev.punteo;
      if (calificacionesMap.has(ev.id)) {
        const score = calificacionesMap.get(ev.id) || 0;
        puntosGanados += score;
        puntosPerdidos += ev.punteo - score;
      } else {
        evaluacionesPendientes.push({ id: ev.id, name: ev.type, punteo: ev.punteo });
      }
    });

    const punteoRestante = punteoAsignado - (puntosGanados + puntosPerdidos);

    return {
      id: materia.id,
      name: materia.name,
      code: materia.code,
      puntosGanados,
      punteoAsignado,
      punteoRestante,
      notaMaximaPosible: 100 - puntosPerdidos,
      evaluacionesPendientes,
    };
  });
}

// 1. Corregimos la firma de la función para que reciba searchParams como una Promesa
export default async function PredictorPage({
  searchParams,
}: {
  searchParams: Promise<{ cicloId?: string }>; 
}) {
  const supabase = createClient();

  // 2. Usamos 'await' para obtener los parámetros de la promesa
  const resolvedSearchParams = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2>Necesitas iniciar sesión para usar el predictor.</h2>
      </div>
    );
  }
  
  // 3. Usamos el objeto de parámetros resuelto
  let cicloIdActivo = resolvedSearchParams?.cicloId;

  if (!cicloIdActivo) {
    const { data: cicloReciente } = await supabase
      .from("ciclos")
      .select("id")
      .eq("user_id", user.id) // <-- Filtro de seguridad
      .order("year", { ascending: false })
      .order("period", { ascending: false })
      .limit(1)
      .single();

    cicloIdActivo = cicloReciente?.id;
  }

  if (!cicloIdActivo) {
    return (
      <div className="p-8 text-center">
        <h2>Selecciona un ciclo para empezar a hacer predicciones.</h2>
      </div>
    );
  }

  const { data: materiasData } = await supabase
    .from("materias")
    .select("*")
    .eq("ciclo_id", cicloIdActivo)
    .eq("user_id", user.id); 

  if (!materiasData || materiasData.length === 0) {
    return <PredictorClient materias={[]} />;
  }

  const materiaIds = materiasData.map((m: any) => m.id);

  const { data: evaluacionesData } = await supabase.from("evaluaciones").select("*").in("materia_id", materiaIds);
  const { data: calificacionesData } = await supabase.from("calificaciones").select("*");

  const materias = procesarDatosParaPredictor(materiasData, evaluacionesData || [], calificacionesData || []);

  return <PredictorClient materias={materias} />;
}