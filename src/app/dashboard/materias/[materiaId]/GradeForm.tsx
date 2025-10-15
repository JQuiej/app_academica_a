'use client'

import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { upsertCalificacion } from "@/app/_actions/calificaciones"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UpdateIcon } from '@radix-ui/react-icons'
import { toast } from "sonner"

interface GradeFormProps {
  evaluacionId: string;
  materiaId: string;
  currentScore?: number | null;
  punteo: number;
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button size="sm" type="submit" disabled={pending}>
      {pending && <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Guardando...' : 'Guardar'}
    </Button>
  )
}

// Una sola definición correcta de la función
export function GradeForm({ evaluacionId, materiaId, currentScore, punteo }: GradeFormProps) {
  const router = useRouter()

  async function handleSaveGrade(formData: FormData) {
    const result = await upsertCalificacion(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Calificación guardada.")
      router.refresh()
    }
  }
  
  return (
    <form action={handleSaveGrade} className="flex items-center gap-2">
      <input type="hidden" name="evaluacion_id" value={evaluacionId} />
      <input type="hidden" name="materia_id" value={materiaId} />
      <Input 
        type="number" 
        name="score" 
        className="h-8 w-20" 
        placeholder="--"
        defaultValue={currentScore ?? ''}
        min="0"
        max={punteo}
        required
      />
      <SubmitButton />
    </form>
  )
}