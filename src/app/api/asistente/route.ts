import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";


export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();
  const cicloId: string | undefined = body?.context?.cicloId;

  // Traer materias del ciclo actual
  let materiasQuery = supabase.from("materias").select("id, name, ciclo_id");
  if (cicloId) materiasQuery = materiasQuery.eq("ciclo_id", cicloId);

  const { data: materias, error: materiasError } = await materiasQuery;
  if (materiasError) {
    return NextResponse.json({
      reply: "Hubo un problema al consultar tus materias.",
    });
  }

  const materiasMap = new Map(materias?.map((m) => [m.id, m.name]) || []);

  // Consultar próximas tareas (ej. próximos 7 días)
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(hoy.getDate() + 7);

  let evalQuery = supabase
    .from("evaluaciones")
    .select("id, type, date, punteo, materia_id");

  if (cicloId && materias?.length) {
    evalQuery = evalQuery.in("materia_id", materias.map((m) => m.id));
  }

  const { data: evaluaciones, error: evalError } = await evalQuery
    .gte("date", hoy.toISOString().split("T")[0])
    .lte("date", limite.toISOString().split("T")[0])
    .order("date", { ascending: true });

  let reply: string;

  if (evalError) {
    reply = "No pude consultar tus próximas tareas.";
  } else if (evaluaciones && evaluaciones.length > 0) {
    reply =
      "📅 Estas son tus próximas tareas:\n" +
      evaluaciones
        .map(
  (ev) =>
    `- ${ev.type} de ${materiasMap.get(ev.materia_id) ?? "una materia"} el ${format(
      parseISO(ev.date),
      "d/M/yyyy",
      { locale: es }
    )} (punteo: ${ev.punteo})`
)
  } else {
    reply = "No tienes tareas en los próximos 7 días.";
  }

  return NextResponse.json({ reply });
}