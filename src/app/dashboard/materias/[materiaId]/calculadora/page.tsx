'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client' // 1. Importar el cliente de browser
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from '@radix-ui/react-icons'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import type { Evaluacion } from '../EvaluacionRow'

type Materia = {
  id: string;
  name: string;
  code: string;
  ciclos: { id: string, year: number, period: string };
}

export default function CalculadoraPage() {
  const params = useParams();
  const materiaId = params.materiaId as string;
  const supabase = createClient(); // 2. Crear la instancia del cliente aquí

  const [materia, setMateria] = useState<Materia | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [grades, setGrades] = useState<Record<string, number | string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const previousPuntos = useRef(0);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      const { data: materiaData } = await supabase.from('materias').select(`*, ciclos ( * )`).eq('id', materiaId).single();
      if (materiaData) setMateria(materiaData as any);

      const { data: evaluacionesData } = await supabase.from('evaluaciones').select(`*`).eq('materia_id', materiaId).order('date');
      const evaluacionIds = evaluacionesData?.map(ev => ev.id) || [];
      const { data: calificacionesData } = await supabase.from('calificaciones').select('evaluacion_id, score').in('evaluacion_id', evaluacionIds);
      
      const initialGrades: Record<string, number | string> = {};
      calificacionesData?.forEach(cal => {
        initialGrades[cal.evaluacion_id] = cal.score;
      });
      
      setGrades(initialGrades);
      setEvaluaciones(evaluacionesData as any || []);
      setIsLoading(false);
    }
    fetchData();
  }, [materiaId, supabase]);

  const handleGradeChange = (evaluacionId: string, value: string, maxPunteo: number) => {
    const numericValue = value === '' ? '' : Number(value);
    if (numericValue === '' || (numericValue >= 0 && numericValue <= maxPunteo)) {
      setGrades(prev => ({ ...prev, [evaluacionId]: numericValue }));
    }
  };

  const calculatedData = useMemo(() => {
    let puntosGanados = 0, punteoTotalAsignado = 0, puntosPerdidos = 0;
    const notaParaAprobar = 61;

    evaluaciones.forEach((evaluacion) => {
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

    return { puntosGanados, punteoTotalAsignado, puntosPerdidos, notaMaximaPosible, mensajeDeEstado, colorDeEstado };
  }, [grades, evaluaciones]);

  useEffect(() => {
    previousPuntos.current = calculatedData.puntosGanados;
  }, [calculatedData.puntosGanados]);

  if (isLoading) return <div className="p-8">Cargando calculadora...</div>;
  if (!materia) return <div className="p-8">Materia no encontrada.</div>;

  return (
    <div className="p-4 md:p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/dashboard/ciclos" className="hover:underline">Mis Ciclos</Link>
            <ChevronRightIcon className="h-4 w-4" />
            {materia.ciclos && <Link href={`/dashboard/ciclos/${materia.ciclos.id}`} className="hover:underline">{materia.ciclos.year} - {materia.ciclos.period}</Link>}
            <ChevronRightIcon className="h-4 w-4" />
            <Link href={`/dashboard/materias/${materia.id}`} className="hover:underline">{materia.name}</Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="font-semibold text-foreground">Calculadora</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Calculadora de Notas: {materia.name}</h1>
        
        <div className="mb-8 p-6 border rounded-lg bg-muted/50">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Calculadora de Progreso</h2>
                <span className="text-2xl font-bold text-primary">
                    <AnimatedCounter from={previousPuntos.current} to={calculatedData.puntosGanados} /> / 100
                </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
                Simulando <span className="font-bold">{calculatedData.puntosGanados.toFixed(2)}</span> puntos de <span className="font-bold">{calculatedData.punteoTotalAsignado}</span> asignados.
                {calculatedData.puntosPerdidos > 0 && <span className="text-red-500 ml-4">({calculatedData.puntosPerdidos.toFixed(2)} puntos perdidos)</span>}
            </p>
            <Progress value={calculatedData.puntosGanados} />
            <div className="mt-4 space-y-2">
                <p className={`text-sm font-medium ${calculatedData.colorDeEstado}`}>
                    {calculatedData.mensajeDeEstado}
                </p>
                <p className="text-sm text-gray-500">
                    Nota máxima posible: <span className="font-bold text-foreground">{calculatedData.notaMaximaPosible.toFixed(2)}</span>
                </p>
            </div>
        </div>

        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead>Nombre de Evaluación</TableHead>
                        <TableHead>Punteo Máximo</TableHead>
                        <TableHead>Nota (Simulación)</TableHead>
                        <TableHead>Puntos Perdidos</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {evaluaciones.map((evaluacion, index) => {
                        const score = grades[evaluacion.id];
                        const puntosPerdidosFila = (score !== undefined && score !== '') ? evaluacion.punteo - Number(score) : null;
                        return (
                            <motion.tr
                                key={evaluacion.id}
                                className="hover:bg-muted/50"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <TableCell className="font-medium">{evaluacion.name}</TableCell>
                                <TableCell>{evaluacion.punteo}</TableCell>
                                <TableCell>
                                    <Input 
                                        type="number"
                                        value={score ?? ''}
                                        onChange={(e) => handleGradeChange(evaluacion.id, e.target.value, evaluacion.punteo)}
                                        placeholder="--"
                                        min="0"
                                        max={evaluacion.punteo}
                                        className="h-8 w-24"
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                  {puntosPerdidosFila !== null && (
                                    <span className={`font-medium ${puntosPerdidosFila > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                      -{puntosPerdidosFila.toFixed(2)}
                                    </span>
                                  )}
                                  {puntosPerdidosFila === null && <span className="text-gray-400">--</span>}
                                </TableCell>
                            </motion.tr>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}