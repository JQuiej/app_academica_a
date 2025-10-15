'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { deleteMateria, updateMateria } from '@/app/_actions/materias'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

interface Materia {
  id: string;
  name: string;
  code: string | null;
  ciclo_id: string;
}

export function MateriaItem({ materia }: { materia: Materia }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  async function handleUpdateMateria(formData: FormData) {
    const result = await updateMateria(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setIsEditDialogOpen(false)
      toast.success("Materia actualizada con éxito.")
    }
  }

  async function handleDeleteMateria() {
    const result = await deleteMateria(materia.id, materia.ciclo_id)
    if (result?.error) {
        toast.error(result.error)
    } else {
        setIsDeleteDialogOpen(false)
        toast.success("Materia eliminada correctamente.")
    }
  }

  return (
    <div className="border p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
      {/* El enlace para ir al detalle de la materia */}
      <Link href={`/dashboard/materias/${materia.id}`} className="flex-grow">
        <h3 className="font-bold text-lg hover:underline">{materia.name}</h3>
        <p className="text-sm text-gray-500">Código: {materia.code || 'N/A'}</p>
      </Link>

      {/* El menú de 3 puntos que había desaparecido */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Editar</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-500">Eliminar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Materia</DialogTitle></DialogHeader>
          <form action={handleUpdateMateria}>
            <input type="hidden" name="id" value={materia.id} />
            <input type="hidden" name="ciclo_id" value={materia.ciclo_id} />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la Materia</Label>
                <Input id="name" name="name" defaultValue={materia.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Código (Opcional)</Label>
                <Input id="code" name="code" defaultValue={materia.code || ''} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta materia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todas las evaluaciones y calificaciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMateria} className="bg-red-500 hover:bg-red-600">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}