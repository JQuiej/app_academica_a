// ⬅️ IMPORTANTE: Agregar estas directivas al inicio
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import { EstadisticasClient, type Estadistica } from "./EstadisticasClient";

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ cicloId?: string }>;
}) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8">Necesitas iniciar sesión.</div>;
  }

  let cicloIdActivo = resolvedSearchParams?.cicloId;

  // Si no hay ciclo, buscar el más reciente
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
    return <EstadisticasClient estadisticas={[]} />;
  }

  // 1. Materias filtradas por ciclo Y usuario
  const { data: materias } = await supabase
    .from("materias")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("ciclo_id", cicloIdActivo) // ⬅️ Filtro por ciclo
    .order("name");

  if (!materias || materias.length === 0) {
    return <EstadisticasClient estadisticas={[]} />;
  }

  const materiaIds = materias.map((m) => m.id);

  // 2. Evaluaciones
  const { data: evaluaciones } = await supabase
    .from("evaluaciones")
    .select("id, type, punteo, materia_id")
    .in("materia_id", materiaIds)
    .order("date");

  const evaluacionIds = evaluaciones?.map(e => e.id) || [];

  // 3. Calificaciones
  const { data: calificaciones } = await supabase
    .from("calificaciones")
    .select("evaluacion_id, score")
    .in("evaluacion_id", evaluacionIds);

  // 4. Procesar estadísticas
  const estadisticas =
    materias?.map((materia) => {
      const stats = {
        tarea: { total: 0, ganados: 0, count: 0 },
        parcial: { total: 0, ganados: 0, count: 0 },
        final: { total: 0, ganados: 0, count: 0 },
      };

      const evsDeMateria = evaluaciones?.filter(
        (ev) => ev.materia_id === materia.id
      );

      evsDeMateria?.forEach((ev) => {
        const cal = calificaciones?.find(
          (c) => c.evaluacion_id === ev.id
        );
        const score = cal?.score;

        if (score !== undefined && score !== null) {
          const key = ev.type.toLowerCase() as keyof typeof stats;
          if (key in stats) {
            stats[key].ganados += score;
            stats[key].total += ev.punteo;
            stats[key].count += 1;
          }
        }
      });

      const totalPuntos =
        stats.tarea.ganados + stats.parcial.ganados + stats.final.ganados;
      const totalPosible =
        stats.tarea.total + stats.parcial.total + stats.final.total;

      return {
        id: materia.id,
        name: materia.name,
        tareas:
          stats.tarea.count > 0
            ? (stats.tarea.ganados / stats.tarea.total) * 100
            : null,
        parciales:
          stats.parcial.count > 0
            ? (stats.parcial.ganados / stats.parcial.total) * 100
            : null,
        finales:
          stats.final.count > 0
            ? (stats.final.ganados / stats.final.total) * 100
            : null,
        promedio: totalPosible > 0 ? (totalPuntos / totalPosible) * 100 : 0,
      };
    }) || [];

  return (
    <EstadisticasClient estadisticas={estadisticas as Estadistica[]} />
  );
}