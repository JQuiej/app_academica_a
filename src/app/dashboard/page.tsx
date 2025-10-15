import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

function procesarDatosDeMaterias(
  materias: any[],
  evaluaciones: any[],
  calificaciones: any[]
) {
  const calificacionesMap = new Map(
    calificaciones.map((c) => [c.evaluacion_id, c.score])
  );
  const evaluacionesPorMateria = new Map<string, any[]>();

  evaluaciones.forEach((e) => {
    if (!evaluacionesPorMateria.has(e.materia_id)) {
      evaluacionesPorMateria.set(e.materia_id, []);
    }
    evaluacionesPorMateria.get(e.materia_id)?.push(e);
  });

  return materias.map((materia) => {
    let puntosGanados = 0;
    let puntosPerdidos = 0;
    const evsDeMateria = evaluacionesPorMateria.get(materia.id) || [];

    evsDeMateria.forEach((evaluacion) => {
      // Solo contamos puntos perdidos de evaluaciones ya calificadas
      if (calificacionesMap.has(evaluacion.id)) {
        const score = calificacionesMap.get(evaluacion.id) || 0;
        puntosGanados += score;
        puntosPerdidos += evaluacion.punteo - score;
      }
    });

    return {
      id: materia.id,
      name: materia.name,
      notaActual: puntosGanados,
      notaMaximaPosible: 100 - puntosPerdidos,
    };
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  // 1. CORRECCIÓN: Definimos searchParams como una Promesa
  searchParams: Promise<{ cicloId?: string }>;
}) {
  const supabase = createClient();

  // 2. CORRECCIÓN: Usamos 'await' para obtener el objeto de la promesa
  const resolvedSearchParams = await searchParams;
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8">Inicia sesión para ver tu dashboard.</div>;
  }

  // 3. CORRECCIÓN: Usamos el objeto resuelto
  let cicloIdActivo = resolvedSearchParams?.cicloId;

  if (!cicloIdActivo) {
    const { data: cicloReciente } = await supabase
      .from("ciclos")
      .select("id")
      .eq("user_id", user.id)
      .order("year", { ascending: false })
      .order("period", { ascending: false })
      .limit(1)
      .single();
    cicloIdActivo = cicloReciente?.id;
  }

  if (!cicloIdActivo) {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">
                    ¡Bienvenido, {user.user_metadata?.full_name || user.email?.split('@')[0]}! 👋
                </h2>
            </div>
            <div className="p-8 text-center bg-background rounded-lg border">
                <h2 className="font-semibold">No hay un ciclo seleccionado.</h2>
                <p className="text-muted-foreground">Por favor, crea o selecciona un ciclo para empezar a ver tus datos.</p>
            </div>
        </div>
    );
  }

  const { data: materias, error: materiasError } = await supabase
    .from("materias")
    .select("id, name")
    .eq("ciclo_id", cicloIdActivo)
    .eq("user_id", user.id);

  if (materiasError) {
    return <div className="p-8">Error al cargar las materias.</div>;
  }
    
  const materiaIds = materias?.map((m) => m.id) || [];
  
  const { data: evaluaciones, error: evError } = await supabase
    .from("evaluaciones")
    .select("id, punteo, materia_id")
    .in("materia_id", materiaIds);

  if (evError) {
    return <div className="p-8">Error al cargar las evaluaciones.</div>;
  }

  const evaluacionIds = evaluaciones?.map(e => e.id) || [];
  
  const { data: calificaciones, error: calError } = await supabase
    .from("calificaciones")
    .select("evaluacion_id, score")
    .in("evaluacion_id", evaluacionIds);

  if (calError) {
    return <div className="p-8">Error al cargar las calificaciones.</div>;
  }

  const datosParaGrafica = procesarDatosDeMaterias(
    materias || [],
    evaluaciones || [],
    calificaciones || []
  );

  const totalNotas = datosParaGrafica.reduce((sum, m) => sum + m.notaActual, 0);
  const promedioGeneral = datosParaGrafica.length > 0 ? totalNotas / datosParaGrafica.length : 0;
  const materiasEnRiesgo = datosParaGrafica.filter(m => m.notaActual < 61 || m.notaMaximaPosible < 61);

  return (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">
            ¡Bienvenido, {user.user_metadata?.full_name || user.email?.split('@')[0]}! 👋
            </h2>
            <p className="text-blue-100">
            Resumen de tu progreso en el ciclo actual.
            </p>
        </div>
        <DashboardClient
            data={datosParaGrafica}
            promedioGeneral={promedioGeneral}
            materiasEnRiesgo={materiasEnRiesgo}
        />
    </div>
  );
}