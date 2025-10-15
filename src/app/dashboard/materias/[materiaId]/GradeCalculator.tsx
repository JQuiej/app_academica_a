'use client'

import { useState, useMemo } from 'react'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EvaluacionRow } from './EvaluacionRow'
import type { Evaluacion } from './EvaluacionRow'

export function GradeCalculator({ initialEvaluaciones, materiaId }: { initialEvaluaciones: Evaluacion[], materiaId: string }) {
  const [grades, setGrades] = useState<Record<string, number | string>>(() => {
    const initialGrades: Record<string, number | string> = {}
    initialEvaluaciones.forEach(ev => {
      const score = ev.calificaciones?.[0]?.score
      if (score !== undefined && score !== null) {
        initialGrades[ev.id] = score
      }
    })
    return initialGrades
  })

  const calculatedData = useMemo(() => {
    let puntosGanados = 0;
    let punteoTotalAsignado = 0;
    let puntosPerdidos = 0;
    const notaParaAprobar = 61;

    initialEvaluaciones.forEach((evaluacion) => {
      punteoTotalAsignado += evaluacion.punteo;
      const currentGrade = grades[evaluacion.id];
      if (currentGrade !== undefined && currentGrade !== '') {
        const score = Number(currentGrade);
        puntosGanados += score;
        puntosPerdidos += evaluacion.punteo - score;
      }
    });

    const notaMaximaPosible = 100 - puntosPerdidos;

    let mensajeDeEstado = '';
    if (notaMaximaPosible < notaParaAprobar) {
      mensajeDeEstado = "Ya no es posible alcanzar la nota para aprobar. ¡Enfoca tus esfuerzos en las demás materias!";
    } else if (puntosGanados >= 100) {
      mensajeDeEstado = `¡Excelente! ¡Has alcanzado la nota perfecta de 100! 🏆`;
    } else if (puntosGanados >= notaParaAprobar) {
      // --- LÓGICA DEL MENSAJE CORREGIDA ---
      if (notaMaximaPosible < 100) {
        mensajeDeEstado = `¡Felicidades, has aprobado! 🎉 Tu nota máxima posible es ${notaMaximaPosible.toFixed(2)}.`;
      } else {
        mensajeDeEstado = "¡Felicidades, has aprobado el curso! 🎉 ¡Ahora a por el 100!";
      }
    } else {
      mensajeDeEstado = `Necesitas ${(notaParaAprobar - puntosGanados).toFixed(2)} puntos más para aprobar. ¡Tú puedes!`;
    }

    return { puntosGanados, punteoTotalAsignado, puntosPerdidos, notaMaximaPosible, mensajeDeEstado };
  }, [grades, initialEvaluaciones]);

  return (
    <>
      {/* --- Cuadro de Progreso (sin cambios) --- */}
      <div className="mb-8 p-6 border rounded-lg bg-muted/50">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Calculadora de Progreso</h2>
          <span className="text-2xl font-bold text-primary">{calculatedData.puntosGanados.toFixed(2)} / 100</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Llevas <span className="font-bold">{calculatedData.puntosGanados.toFixed(2)}</span> puntos de <span className="font-bold">{calculatedData.punteoTotalAsignado}</span> asignados.
          {calculatedData.puntosPerdidos > 0 && <span className="text-red-500 ml-4">({calculatedData.puntosPerdidos.toFixed(2)} puntos perdidos)</span>}
        </p>
        <Progress value={calculatedData.puntosGanados} />
        <div className="mt-4 space-y-2">
          <p className={`text-sm font-medium ${calculatedData.puntosGanados >= 61 ? 'text-green-600' : 'text-blue-600'}`}>
            {calculatedData.mensajeDeEstado}
          </p>
          <p className="text-sm text-gray-500">
            Nota máxima posible: <span className="font-bold text-foreground">{calculatedData.notaMaximaPosible.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* --- Tabla con Botones Restaurados --- */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Punteo</TableHead>
              <TableHead>Calificación</TableHead>
              <TableHead>Puntos Perdidos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialEvaluaciones.map((evaluacion) => (
              // Usamos el componente EvaluacionRow original, que ya tiene toda la lógica de acciones
              <EvaluacionRow 
                key={evaluacion.id} 
                evaluacion={evaluacion} 
              />
            ))}
          </TableBody>
        </Table>
         {initialEvaluaciones?.length === 0 && (
          <div className="text-center p-10">
            <p className="text-gray-500">No has añadido ninguna evaluación para esta materia.</p>
          </div>
        )}
      </div>
    </>
  )
}