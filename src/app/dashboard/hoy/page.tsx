import { addDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function HoyPage({
  searchParams,
}: {
  searchParams: Promise<{ cicloId?: string }>;
}) {
  const supabase = await createClient();

  const hoy = new Date();
  const proximos3Dias = addDays(hoy, 3);

  const params = await searchParams;
  let cicloIdActivo = params?.cicloId;

  // Si no hay ciclo en la URL, buscamos el más reciente
  if (!cicloIdActivo) {
    const { data: cicloReciente } = await supabase
      .from("ciclos")
      .select("id, year, period")
      .order("year", { ascending: false })
      .order("period", { ascending: false })
      .limit(1)
      .single();

    cicloIdActivo = cicloReciente?.id;
  }

  if (!cicloIdActivo) {
    return (
      <div className="p-8 text-center">
        <h2>Selecciona un ciclo para empezar.</h2>
      </div>
    );
  }

  // 1. Obtener materias del ciclo
  const { data: materias } = await supabase
    .from("materias")
    .select("id, name") // 👈 aquí sí existe name en materias
    .eq("ciclo_id", cicloIdActivo);

  const materiaIds = materias?.map((m) => m.id) || [];

  // Creamos un mapa id → nombre
  const materiasMap = new Map(materias?.map((m) => [m.id, m.name]) || []);

  // 2. Obtener evaluaciones de esas materias
  const { data: proximasEvaluaciones, error } = await supabase
    .from("evaluaciones")
    .select("id, type, date, punteo, materia_id")
    .in("materia_id", materiaIds)
    .gte("date", hoy.toISOString().split("T")[0]) // campo tipo DATE
    .lte("date", proximos3Dias.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("Error cargando evaluaciones:", error.message);
    return <div className="p-8">Error al cargar las evaluaciones.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Hoy y próximos 3 días</h1>

      {proximasEvaluaciones && proximasEvaluaciones.length > 0 ? (
        <ul className="space-y-3">
          {proximasEvaluaciones.map((ev) => (
            <li
              key={ev.id}
              className="p-4 border rounded-md bg-background shadow-sm"
            >
              <h2 className="font-semibold">{ev.type}</h2>
              <p className="text-sm text-muted-foreground">
                Fecha: {format(parseISO(ev.date), "d/M/yyyy", { locale: es })}
              </p>

              <p className="text-sm text-muted-foreground">
                Materia: {materiasMap.get(ev.materia_id) ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                Punteo: {ev.punteo ?? "—"}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">
          No hay evaluaciones en los próximos 3 días.
        </p>
      )}
    </div>
  );
}