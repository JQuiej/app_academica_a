'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { Ciclo } from '@/app/_actions/ciclos'
import { createCiclo } from '@/app/_actions/ciclos'
import { useAuth } from '@/components/ui/AuthProvider' // 1. Usar el hook de autenticación
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CicloCard } from './CicloCard'

export default function CiclosPage() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 2. Obtener el usuario y el cliente de Supabase del contexto
  const { user, supabase } = useAuth();

  // 3. Función para cargar los ciclos del usuario, envuelta en useCallback
  const fetchCiclos = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('ciclos')
      .select('*')
      .eq('user_id', user.id) // <-- El filtro clave
      .order('year', { ascending: false })
      .order('period', { ascending: false });
      
    if (error) {
        toast.error('No se pudieron cargar los ciclos.', { description: error.message });
    } else if (data) {
      setCiclos(data as Ciclo[]);
    }
    setIsLoading(false);
  }, [user, supabase]);

  // 4. useEffect que llama a la función de carga
  useEffect(() => {
    fetchCiclos();
  }, [fetchCiclos]);

  // 5. Función manejadora que procesa la respuesta de la Server Action
  async function handleCreateCiclo(formData: FormData) {
    const result = await createCiclo(formData);

    if (result?.error) {
      toast.error("Error al crear el ciclo", { description: result.error });
    } else {
      setIsCreateDialogOpen(false);
      toast.success("Ciclo creado con éxito.");
      await fetchCiclos(); // Vuelve a cargar los ciclos correctamente
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Mis Ciclos Académicos</h1>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">Crear Nuevo Ciclo</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Ciclo</DialogTitle>
              <DialogDescription>
                Añade un nuevo ciclo o semestre para organizar tus materias.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateCiclo} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="year">Año</Label>
                <Input id="year" name="year" type="number" defaultValue={new Date().getFullYear()} required/>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="period">Periodo</Label>
                <Input id="period" name="period" placeholder="Ej: Semestre 1, Ciclo 2" required/>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Añade una breve descripción del ciclo..."
                />
              </div>
              <DialogFooter>
                <Button type="submit">Guardar Ciclo</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
         <div className="text-center text-muted-foreground">Cargando ciclos...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ciclos.map((ciclo) => (
            <CicloCard key={ciclo.id} ciclo={ciclo} />
            ))}
            {ciclos.length === 0 && (
            <div className="col-span-full text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">No has creado ningún ciclo todavía.</p>
                <p className="text-sm text-gray-400">¡Usa el botón "Crear Nuevo Ciclo" para empezar!</p>
            </div>
            )}
        </div>
      )}
    </div>
  )
}
