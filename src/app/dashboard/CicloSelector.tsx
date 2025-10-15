'use client'

import { useEffect } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Ciclo = {
  id: string
  year: number
  period: string
  description?: string | null // <-- Corregido para aceptar null
}

export function CicloSelector({ ciclos }: { ciclos: Ciclo[] }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const cicloIdActual = searchParams.get('cicloId') || ''

  const handleSelect = (cicloId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('cicloId', cicloId)
    // Usamos scroll: false para evitar que la página salte al inicio al cambiar el selector
    replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Selecciona automáticamente el primer ciclo si no hay ninguno válido en la URL
  useEffect(() => {
    const cicloValidoSeleccionado = ciclos.some(c => c.id === cicloIdActual);
    if (!cicloValidoSeleccionado && ciclos.length > 0) {
      // Llamamos a la función directamente en lugar de hacerla una dependencia
      handleSelect(ciclos[0].id)
    }
  // La dependencia de handleSelect se elimina para evitar re-renders innecesarios
  }, [cicloIdActual, ciclos, pathname, replace, searchParams])


  // Aseguramos que el valor mostrado en el Select siempre sea uno válido de la lista
  const valorSeleccionado = ciclos.some(c => c.id === cicloIdActual) ? cicloIdActual : ''

  return (
    <div className="w-full">
      <Select value={valorSeleccionado} onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar ciclo..." />
        </SelectTrigger>
        <SelectContent>
          {ciclos.length > 0 ? (
            ciclos.map(ciclo => (
              <SelectItem key={ciclo.id} value={ciclo.id}>
                {ciclo.year} - {ciclo.period} {ciclo.description ? `(${ciclo.description})` : ""}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-muted-foreground">No hay ciclos para mostrar</div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}