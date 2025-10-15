'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createMateria } from '@/app/_actions/materias'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CreateMateriaButton({ cicloId }: { cicloId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  async function handleCreateMateria(formData: FormData) {
    const result = await createMateria(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setIsOpen(false)
      toast.success("Materia creada con éxito.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Agregar Materia</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Materia</DialogTitle>
          <DialogDescription>
            Añade una nueva materia a este ciclo.
          </DialogDescription>
        </DialogHeader>
        <form action={handleCreateMateria}>
          <input type="hidden" name="ciclo_id" value={cicloId} />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de la Materia</Label>
              <Input id="name" name="name" placeholder="Ej: Cálculo I" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Código (Opcional)</Label>
              <Input id="code" name="code" placeholder="Ej: MATE-101" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar Materia</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}