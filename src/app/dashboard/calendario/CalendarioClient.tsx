// app/dashboard/calendario/CalendarioClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  parseISO
} from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

export interface Evaluacion {
  id: string
  name: string
  type: 'tarea' | 'parcial' | 'final'
  date: string
  punteo: number
  materias: {
    id: string
    name: string
    code: string | null
  } | null
}

export function CalendarioClient({ evaluaciones }: { evaluaciones: Evaluacion[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [vista, setVista] = useState<'calendario' | 'lista'>('calendario')

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { locale: es })
  const calendarEnd = endOfWeek(monthEnd, { locale: es })

  const diasDelMes = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const evaluacionesPorDia = useMemo(() => {
    const map = new Map<string, Evaluacion[]>()
    evaluaciones.forEach(ev => {
      const dateKey = format(parseISO(ev.date), 'yyyy-MM-dd')
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(ev)
    })
    return map
  }, [evaluaciones])

  const getColorPorTipo = (tipo: string) => {
    switch (tipo) {
      case 'tarea': return 'bg-blue-500'
      case 'parcial': return 'bg-yellow-500'
      case 'final': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const proximasEvaluaciones = useMemo(() => {
    const hoy = new Date()
    return evaluaciones
      .filter(ev => parseISO(ev.date) >= hoy)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 10)
  }, [evaluaciones])

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendario de Evaluaciones</h1>
          <p className="text-muted-foreground">
            {evaluaciones.length} evaluaciones programadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={vista === 'calendario' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVista('calendario')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button
            variant={vista === 'lista' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVista('lista')}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>
      </div>

      {vista === 'calendario' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                <div key={dia} className="text-center text-sm font-semibold text-muted-foreground p-2">
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {diasDelMes.map(dia => {
                const dateKey = format(dia, 'yyyy-MM-dd')
                const evaluacionesDelDia = evaluacionesPorDia.get(dateKey) || []
                const esDelMes = isSameMonth(dia, currentDate)
                const esHoy = isToday(dia)

                return (
                  <div
                    key={dia.toString()}
                    className={`min-h-24 p-2 border rounded-lg ${
                      !esDelMes ? 'bg-muted/30 text-muted-foreground' : 'bg-background'
                    } ${esHoy ? 'border-primary border-2' : 'border-border'}`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${esHoy ? 'text-primary' : ''}`}>
                      {format(dia, 'd')}
                    </div>
                    <div className="space-y-1">
                      {evaluacionesDelDia.slice(0, 3).map(ev => (
                        <Link key={ev.id} href={`/dashboard/materias/${ev.materias?.id}`}>
                          <div
                            className={`text-xs p-1 rounded truncate ${getColorPorTipo(ev.type)} text-white hover:opacity-80 transition-opacity`}
                            title={`${ev.name} - ${ev.materias?.name}`}
                          >
                            {ev.name}
                          </div>
                        </Link>
                      ))}
                      {evaluacionesDelDia.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{evaluacionesDelDia.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Tarea</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm">Parcial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Final</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Próximas Evaluaciones</CardTitle>
          </CardHeader>
          <CardContent>
            {proximasEvaluaciones.length > 0 ? (
              <div className="space-y-3">
                {proximasEvaluaciones.map(ev => (
                  <Link key={ev.id} href={`/dashboard/materias/${ev.materias?.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{ev.name}</h3>
                          <Badge variant={ev.type === 'final' ? 'destructive' : 'secondary'}>
                            {ev.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ev.materias?.name} • {ev.punteo} pts
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {format(parseISO(ev.date), 'd MMM', { locale: es })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(ev.date), 'EEEE', { locale: es })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No hay evaluaciones próximas</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}