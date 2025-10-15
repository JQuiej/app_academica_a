import Buscador from "@/components/ui/Buscador";

export const dynamic = "force-dynamic";

export default function BuscadorPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">Buscador</h1>
      <p className="text-muted-foreground mb-6">
        Escribe lo que quieras consultar y se abrirán los resultados en Bing.
      </p>
      <Buscador />
    </div>
  );
}