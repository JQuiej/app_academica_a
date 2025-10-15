'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingUp, Target, AlertCircle } from 'lucide-react'

interface Materia {
  id: string
  name: string
  code: string | null
  puntosGanados: number
  punteoAsignado: number
  punteoRestante: number
  notaMaximaPosible: number
  evaluacionesPendientes: Array<{
    id: string
    name: string
    punteo: number
  }>
}

export function PredictorClient({ materias }: { materias: Materia[] }) {
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>('')
  const [notaDeseada, setNotaDeseada] = useState<number>(61)

  const materia = materias.find(m => m.id === materiaSeleccionada)

  const calcularPromedioNecesario = () => {
    if (!materia) return null

    const puntosNecesarios = notaDeseada - materia.puntosGanados

    if (puntosNecesarios <= 0) {
      return {
        tipo: 'aprobado',
        mensaje: `¡Ya tienes ${materia.puntosGanados.toFixed(1)} puntos! Ya alcanzaste esta meta.`,
        promedioNecesario: 0,
        esAlcanzable: true
      }
    }

    if (materia.punteoRestante === 0) {
      return {
        tipo: 'sin-evaluaciones',
        mensaje: 'No tienes evaluaciones pendientes en esta materia.',
        promedioNecesario: 0,
        esAlcanzable: materia.puntosGanados >= notaDeseada
      }
    }

    const promedioNecesario = (puntosNecesarios / materia.punteoRestante) * 100

    if (promedioNecesario > 100) {
      return {
        tipo: 'imposible',
        mensaje: `Ya no es posible alcanzar ${notaDeseada} puntos. Tu máximo es ${materia.notaMaximaPosible.toFixed(1)}.`,
        promedioNecesario,
        esAlcanzable: false
      }
    }

    return {
      tipo: 'alcanzable',
      mensaje: `Necesitas sacar un promedio de ${promedioNecesario.toFixed(1)}% en las evaluaciones restantes.`,
      promedioNecesario,
      esAlcanzable: true,
      puntosNecesarios
    }
  }

  const resultado = materia ? calcularPromedioNecesario() : null

  const escenarios = [
    { nota: 61, label: 'Aprobar' },
    { nota: 70, label: 'Nota Buena' },
    { nota: 80, label: 'Nota Alta' },
    { nota: 90, label: 'Excelencia' },
    { nota: 100, label: 'Perfecto' }
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Predictor de Notas</h1>
        <p className="text-muted-foreground">
          Descubre qué necesitas para alcanzar tu meta
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel de selección */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Configuración</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecciona una materia</Label>
                <Select value={materiaSeleccionada} onValueChange={setMateriaSeleccionada}>
                  <SelectTrigger><SelectValue placeholder="Elige una materia..." /></SelectTrigger>
                  <SelectContent>
                    {materias.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nota-deseada">Nota que deseas alcanzar</Label>
                <Input
                  id="nota-deseada"
                  type="number"
                  min="0" max="100"
                  value={notaDeseada}
                  onChange={(e) => setNotaDeseada(Number(e.target.value))}
                />
              </div>

              {materia && (
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Puntos actuales:</span><span className="font-semibold">{materia.puntosGanados.toFixed(1)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Punteo asignado:</span><span className="font-semibold">{materia.punteoAsignado}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Punteo restante:</span><span className="font-semibold">{materia.punteoRestante}</span></div>
                  <div className="flex justify-between text-sm pt-2 border-t"><span className="text-muted-foreground">Nota máxima posible:</span><span className="font-bold text-primary">{materia.notaMaximaPosible.toFixed(1)}</span></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-2 space-y-4">
          {!materia ? (
            <Card className="h-full"><CardContent className="flex flex-col items-center justify-center h-full py-12"><Calculator className="h-16 w-16 text-muted-foreground mb-4" /><p className="text-muted-foreground text-center">Selecciona una materia para comenzar</p></CardContent></Card>
          ) : (
            <>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Resultado del Cálculo</CardTitle></CardHeader>
                <CardContent>
                  {resultado && (
                    <div className={`p-6 rounded-lg border-2 ${resultado.tipo === 'aprobado' ? 'bg-green-50 border-green-200' : resultado.tipo === 'imposible' ? 'bg-red-50 border-red-200' : resultado.tipo === 'sin-evaluaciones' ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-start gap-3">
                        {resultado.tipo === 'imposible' ? <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" /> : <TrendingUp className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />}
                        <div className="flex-1">
                          <p className="font-semibold text-lg mb-2">{resultado.mensaje}</p>
                          {resultado.tipo === 'alcanzable' && resultado.puntosNecesarios && (
                            <div className="space-y-2 mt-4">
                              <p className="text-sm text-muted-foreground">Necesitas <span className="font-bold text-foreground">{resultado.puntosNecesarios.toFixed(1)} puntos</span> más de {materia.punteoRestante} disponibles</p>
                              {materia.evaluacionesPendientes.length > 0 && (
                                <div className="mt-4 p-4 bg-white rounded-lg"><p className="font-medium mb-2">Por evaluación pendiente:</p><div className="space-y-2">
                                    {materia.evaluacionesPendientes.map(ev => {
                                      const puntosNecesarios = (resultado.puntosNecesarios! / materia.evaluacionesPendientes.length)
                                      const porcentaje = (puntosNecesarios / ev.punteo) * 100
                                      return (
                                        <div key={ev.id} className="flex justify-between items-center text-sm">
                                          <span>{ev.name}</span>
                                          <div className="text-right">
                                            <span className="font-semibold">{puntosNecesarios.toFixed(1)} / {ev.punteo}</span>
                                            <span className="text-muted-foreground ml-2">({porcentaje.toFixed(0)}%)</span>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">* Asumiendo distribución uniforme</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Escenarios Rápidos</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {escenarios.map(escenario => {
                      const puntosNecesarios = escenario.nota - materia.puntosGanados
                      const esAlcanzable = puntosNecesarios <= 0 || (materia.punteoRestante > 0 && (puntosNecesarios / materia.punteoRestante) * 100 <= 100)
                      const promedio = materia.punteoRestante > 0 ? (puntosNecesarios / materia.punteoRestante) * 100 : 0
                      return (
                        <button key={escenario.nota} onClick={() => setNotaDeseada(escenario.nota)} className={`p-4 rounded-lg border-2 transition-all text-left ${notaDeseada === escenario.nota ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <div className="flex items-center justify-between mb-2"><span className="font-semibold">{escenario.label}</span><Badge variant={esAlcanzable ? "default" : "destructive"}>{escenario.nota}</Badge></div>
                          {puntosNecesarios <= 0 ? <p className="text-xs text-green-600 font-medium">Ya alcanzado</p> : esAlcanzable ? <p className="text-xs text-muted-foreground">Promedio: {promedio.toFixed(0)}%</p> : <p className="text-xs text-red-600 font-medium">No alcanzable</p>}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}