'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createEvaluacion } from '@/app/_actions/evaluaciones'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'

export function CreateEvaluacionButton({ materiaId }: { materiaId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>()

  async function handleCreateEvaluacion(formData: FormData) {
    if (date) {
      formData.set('date', format(date, "yyyy-MM-dd"))
    }

    const result = await createEvaluacion(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setIsOpen(false)
      setDate(undefined)
      toast.success("Evaluación creada con éxito.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Agregar Evaluación</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Evaluación</DialogTitle>
          <DialogDescription>
            Define una nueva evaluación para esta materia.
          </DialogDescription>
        </DialogHeader>
        <form action={handleCreateEvaluacion}>
          <input type="hidden" name="materia_id" value={materiaId} />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de la Evaluación</Label>
              <Input id="name" name="name" placeholder="Ej: Parcial 1" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Evaluación</Label>
              <Select name="type" required>
                <SelectTrigger><SelectValue placeholder="Selecciona un tipo..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tarea">Tarea</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="font-normal justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Selecciona una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="punteo">Punteo Máximo</Label>
              <Input id="punteo" name="punteo" type="number" placeholder="Ej: 15" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar Evaluación</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}