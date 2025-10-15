import { createClient } from '@/lib/supabase/server';
import { CreateMateriaButton } from './CreateMateriaButton';
import { MateriaItem } from './MateriaItem';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

export default async function CicloDetailPage({ 
  params 
}: { 
  // 1. CORRECCIÓN: Se define `params` como una Promesa
  params: Promise<{ id: string }>; 
}) {
  const supabase = createClient();
  
  // 2. CORRECCIÓN: Se "espera" (await) la promesa para obtener los parámetros
  const resolvedParams = await params;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8">Usuario no autenticado. Por favor, inicia sesión.</div>;
  }

  const { data: ciclo } = await supabase
    .from('ciclos')
    .select('*')
    // 3. CORRECCIÓN: Se usa el parámetro resuelto
    .eq('id', resolvedParams.id) 
    .eq('user_id', user.id)
    .single();

  if (!ciclo) {
    return <div className="p-8">Ciclo no encontrado o no tienes permiso para verlo.</div>
  }

  const { data: materias } = await supabase
    .from('materias')
    .select('*')
    // 3. CORRECCIÓN: Se usa el parámetro resuelto
    .eq('ciclo_id', resolvedParams.id) 
    .eq('user_id', user.id)
    .order('created_at');
  
  return (
    <div className="p-4 md:p-8">
      <div className="mb-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/ciclos">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver a Mis Ciclos
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Materias del Ciclo</h1>
          <p className="text-lg text-gray-600">{ciclo.year} - {ciclo.period}</p>
        </div>
        <CreateMateriaButton cicloId={ciclo.id} />
      </div>

      <div className="space-y-4">
        {materias?.map((materia) => (
          <MateriaItem key={materia.id} materia={materia as any} />
        ))}
        {materias?.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">Aún no has añadido materias a este ciclo.</p>
            <p className="text-sm text-gray-400">¡Usa el botón "Agregar Materia" para empezar!</p>
          </div>
        )}
      </div>
    </div>
  )
}