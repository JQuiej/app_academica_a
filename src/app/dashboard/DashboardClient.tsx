'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface ChartData {
  id: string;
  name: string;
  notaActual: number;
  notaMaximaPosible: number;
}

interface DashboardClientProps {
  data: ChartData[];
  promedioGeneral: number;
  materiasEnRiesgo: ChartData[];
}

export function DashboardClient({ data, promedioGeneral, materiasEnRiesgo }: DashboardClientProps) {
  return (
    <div className="space-y-4">
      {/* --- SECCIÓN DE GRÁFICAS RESTAURADA --- */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Tarjeta para el Promedio General */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Promedio General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-center py-8">
              {promedioGeneral.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta para la Gráfica de Barras */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Rendimiento por Materia</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="notaActual" fill="#8884d8" name="Nota Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- NUEVA SECCIÓN DE ALERTAS ANIMADAS --- */}
      {materiasEnRiesgo.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Alertas de Rendimiento</h2>
          <div className="space-y-3">
            {materiasEnRiesgo.map((materia, index) => (
              <motion.div
                key={materia.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{materia.name}</AlertTitle>
                  <AlertDescription>
                    {materia.notaMaximaPosible < 61
                      ? `Ya no es posible aprobar esta materia (máximo alcanzable: ${materia.notaMaximaPosible.toFixed(2)}).`
                      : `Tu nota actual es ${materia.notaActual.toFixed(2)}, por debajo de la nota para aprobar.`}
                  </AlertDescription>
                </Alert>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}