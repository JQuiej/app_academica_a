'use client'

// <-- 1. Import useState for dialog state and toast from sonner
import { useState } from 'react'
import { toast } from 'sonner'



import type { Ciclo } from '@/app/_actions/ciclos'
import { deleteCiclo, updateCiclo } from '@/app/_actions/ciclos'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

export function CicloCard({ ciclo }: { ciclo: Ciclo }) {
  // <-- 2. Create state variables to control the dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // <-- 3. Create a client-side "handler" for the update action
  async function handleUpdateCiclo(formData: FormData) {
    await updateCiclo(formData)
    setIsEditDialogOpen(false) // Close the dialog
    toast.success("Ciclo actualizado con éxito.") // Show the success toast
  }

  // <-- 4. Create a handler for the delete action
async function handleDeleteCiclo() {
  const result = await deleteCiclo(ciclo.id)
  if (result?.error) {
    toast.error(result.error)
    return
  }
  toast.success("Ciclo eliminado correctamente.")
  setIsDeleteDialogOpen(false)
}
  return (
    <div className="border p-4 rounded-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex justify-between items-start">
          <Link href={`/dashboard/ciclos/${ciclo.id}`}>
            <h2 className="text-lg font-semibold hover:underline">{ciclo.year} - {ciclo.period}</h2>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* These items now just toggle the state to open the dialogs */}
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-500">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-gray-500 mt-2">{ciclo.description || 'Sin descripción'}</p>
      </div>
      <Button variant="outline" size="sm" asChild className="mt-4">
        <Link href={`/dashboard/ciclos/${ciclo.id}`}>Ver Materias</Link>
      </Button>

      {/* Edit Dialog: Now controlled by state */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ciclo</DialogTitle>
          </DialogHeader>
          {/* <-- 5. The form now calls our client-side handler */}
          <form action={handleUpdateCiclo} className="grid gap-4 py-4">
            <input type="hidden" name="id" value={ciclo.id} />
            <div className="grid gap-2">
              <Label htmlFor="year">Año</Label>
              <Input id="year" name="year" type="number" defaultValue={ciclo.year} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="period">Periodo</Label>
              <Input id="period" name="period" defaultValue={ciclo.period} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea id="description" name="description" defaultValue={ciclo.description || ''} />
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog: Now controlled by state */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminará el ciclo permanentemente
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {/* <-- 6. The action button now calls our delete handler */}
            <AlertDialogAction onClick={handleDeleteCiclo} className="bg-red-500 hover:bg-red-600">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}