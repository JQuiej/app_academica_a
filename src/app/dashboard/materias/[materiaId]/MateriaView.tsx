'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from '@radix-ui/react-icons'
import { Calculator } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { CreateEvaluacionButton } from './CreateEvaluacionButton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EvaluacionRow } from './EvaluacionRow'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import type { Evaluacion } from './EvaluacionRow' // <-- 1. Importamos el tipo existente

// --- 2. CREAMOS EL "CONTRATO" PARA NUESTRAS PROPS ---
interface MateriaViewProps {
  materia: { id: string; name: string; code: string; };
  evaluaciones: Evaluacion[];
  ciclo: { id: string; year: number; period: string; } | null;
  calculos: {
    puntosGanados: number;
    punteoTotalAsignado: number;
    puntosPerdidos: number;
    notaParaAprobar: number;
    notaMaximaPosible: number;
    mensajeDeEstado: string;
    colorDeEstado: string;
  };
}

// 3. APLICAMOS EL CONTRATO A LA FUNCIÓN
export function MateriaView({ materia, evaluaciones, ciclo, calculos }: MateriaViewProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const previousPoints = useRef(calculos.puntosGanados)
  const { width, height } = useWindowSize()

  useEffect(() => {
    const justPassed = 
      previousPoints.current < calculos.notaParaAprobar && 
      calculos.puntosGanados >= calculos.notaParaAprobar;

    if (justPassed) {
      setShowConfetti(true)
    }
    
    previousPoints.current = calculos.puntosGanados;
  }, [calculos.puntosGanados, calculos.notaParaAprobar]);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={300}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}

      {/* El resto del JSX de la página se queda aquí */}
      <div className="p-4 md:p-8">
        {/* --- Breadcrumbs y Encabezado --- */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/dashboard/ciclos" className="hover:underline">Mis Ciclos</Link>
          <ChevronRightIcon className="h-4 w-4" />
          {ciclo && <Link href={`/dashboard/ciclos/${ciclo.id}`} className="hover:underline">{ciclo.year} - {ciclo.period}</Link>}
          <ChevronRightIcon className="h-4 w-4" />
          <span className="font-semibold text-foreground">{materia.name}</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{materia.name}</h1>
            <p className="text-lg text-gray-600">Código: {materia.code || 'N/A'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/materias/${materia.id}/calculadora`}>
              <Button variant="outline"><Calculator className="mr-2 h-4 w-4" />Calculadora</Button>
            </Link>
            <CreateEvaluacionButton materiaId={materia.id} />
          </div>
        </div>

        {/* --- Visualización del Progreso --- */}
        <div className="mb-8 p-6 border rounded-lg bg-muted/50">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Progreso del Curso</h2>
            <span className="text-2xl font-bold text-primary">{calculos.puntosGanados.toFixed(2)} / 100</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Llevas <span className="font-bold">{calculos.puntosGanados.toFixed(2)}</span> puntos de <span className="font-bold">{calculos.punteoTotalAsignado}</span> asignados.
            {calculos.puntosPerdidos > 0 && <span className="text-red-500 ml-4">({calculos.puntosPerdidos.toFixed(2)} puntos perdidos en total)</span>}
          </p>
          <Progress value={calculos.puntosGanados} />
          <div className="mt-4 space-y-2">
            <p className={`text-sm font-medium ${calculos.colorDeEstado}`}>{calculos.mensajeDeEstado}</p>
            <p className="text-sm text-gray-500">Nota máxima posible: <span className="font-bold text-foreground">{calculos.notaMaximaPosible.toFixed(2)}</span></p>
          </div>
        </div>

        {/* --- Tabla de Evaluaciones --- */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
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
              {evaluaciones?.map((evaluacion) => (
                <EvaluacionRow key={evaluacion.id} evaluacion={evaluacion as any} />
              ))}
            </TableBody>
          </Table>
          {evaluaciones?.length === 0 && (
            <div className="text-center p-10"><p className="text-gray-500">No has añadido ninguna evaluación.</p></div>
          )}
        </div>
      </div>
    </>
  )
}