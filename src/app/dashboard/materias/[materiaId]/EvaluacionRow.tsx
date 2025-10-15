'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateEvaluacion, deleteEvaluacion } from '@/app/_actions/evaluaciones'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import { format, parseISO } from 'date-fns'
import { GradeForm } from './GradeForm'
import { useRouter } from 'next/navigation'

// ✅ imports adicionales
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'
import { parse } from 'path'

export type Evaluacion = {
  id: string;
  name: string;
  type: 'tarea' | 'parcial' | 'final';
  date: string;
  punteo: number;
  materia_id: string;
  calificaciones: { score: number }[] | null;
}

interface EvaluacionRowProps {
  evaluacion: Evaluacion;
}

export function EvaluacionRow({ evaluacion }: EvaluacionRowProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(parseISO(evaluacion.date))
  const router = useRouter()

  async function handleUpdate(formData: FormData) {
    if (date) {
      // ✅ Normalizamos la fecha para evitar desfase de zona horaria
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      formData.set('date', `${year}-${month}-${day}`)
    }

    const result = await updateEvaluacion(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setIsEditDialogOpen(false)
      toast.success("Evaluación actualizada con éxito.")
      router.refresh()
    }
  }

  async function handleDelete() {
    const result = await deleteEvaluacion(evaluacion.id, evaluacion.materia_id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setIsDeleteDialogOpen(false)
      toast.success("Evaluación eliminada con éxito.")
      router.refresh()
    }
  }

  const score = evaluacion.calificaciones?.[0]?.score
  const puntosPerdidosEnFila =
    score !== undefined && score !== null ? evaluacion.punteo - score : null

  return (
    <TableRow>
      <TableCell className="font-medium">{evaluacion.name}</TableCell>
      <TableCell className="capitalize">{evaluacion.type}</TableCell>
      <TableCell>{format(parseISO(evaluacion.date), 'PPP')}</TableCell>
      <TableCell>{evaluacion.punteo}</TableCell>
      <TableCell>
        <GradeForm
          evaluacionId={evaluacion.id}
          materiaId={evaluacion.materia_id}
          currentScore={score}
          punteo={evaluacion.punteo}
        />
      </TableCell>
      <TableCell className="text-center">
        {puntosPerdidosEnFila !== null ? (
          <span
            className={`font-medium ${
              puntosPerdidosEnFila > 0 ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            -{puntosPerdidosEnFila.toFixed(2)}
          </span>
        ) : (
          <span className="text-gray-400">--</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <DotsHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-500"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Diálogo de Edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar evaluación</DialogTitle>
            </DialogHeader>

            <form action={handleUpdate} className="space-y-4">
              <input type="hidden" name="id" value={evaluacion.id} />
              <input type="hidden" name="materia_id" value={evaluacion.materia_id} />

              {/* Nombre */}
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" defaultValue={evaluacion.name} required />
              </div>

              {/* Tipo */}
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" defaultValue={evaluacion.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tarea">Tarea</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha */}
              <div>
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Punteo */}
              <div>
                <Label htmlFor="punteo">Punteo</Label>
                <Input
                  id="punteo"
                  name="punteo"
                  type="number"
                  defaultValue={evaluacion.punteo}
                  required
                />
              </div>

              {/* Calificación */}
              <div>
                <Label htmlFor="score">Calificación</Label>
                <Input
                  id="score"
                  name="score"
                  type="number"
                  defaultValue={evaluacion.calificaciones?.[0]?.score ?? ""}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Confirmación para Eliminar */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar evaluación?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" onClick={handleDelete}>
                  Eliminar
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  )
}