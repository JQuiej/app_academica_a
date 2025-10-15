// src/app/dashboard/estadisticas/page.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart3 } from 'lucide-react'

// 1. Definimos la forma de los datos que vamos a recibir
export interface Estadistica {
  id: string;
  name: string;
  tareas: number | null;
  parciales: number | null;
  finales: number | null;
  promedio: number;
}

// 2. Pequeña función para formatear y colorear los porcentajes
const formatPorcentaje = (valor: number | null) => {
  if (valor === null) {
    return <span className="text-muted-foreground">-</span>
  }
  const color = valor >= 61 ? 'text-green-600' : 'text-orange-600'
  return <span className={`font-semibold ${color}`}>{valor.toFixed(1)}%</span>
}

export function EstadisticasClient({ estadisticas }: { estadisticas: Estadistica[] }) {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Estadísticas Detalladas</h1>
        <p className="text-muted-foreground">
          Tu rendimiento por tipo de evaluación en cada materia.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tabla Comparativa de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Materia</TableHead>
                <TableHead className="text-center">Tareas</TableHead>
                <TableHead className="text-center">Parciales</TableHead>
                <TableHead className="text-center">Finales</TableHead>
                <TableHead className="text-center font-bold">Promedio Actual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estadisticas.map(stat => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.name}</TableCell>
                  <TableCell className="text-center">{formatPorcentaje(stat.tareas)}</TableCell>
                  <TableCell className="text-center">{formatPorcentaje(stat.parciales)}</TableCell>
                  <TableCell className="text-center">{formatPorcentaje(stat.finales)}</TableCell>
                  <TableCell className="text-center">{formatPorcentaje(stat.promedio)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}