import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "./DashboardNav";
import UserProfilePanel from "@/components/ui/UserProfilePanel";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient(); // ⬅️ Un solo await aquí

  // 1. Verificamos la sesión del usuario al inicio del layout.
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario, redirigir
  if (!user) {
    redirect('/login');
  }

  // 2. Obtenemos los ciclos SOLO si hay un usuario, y los filtramos por su ID.
  const { data: ciclos } = await supabase
    .from("ciclos")
    .select("id, year, period, description")
    .eq("user_id", user.id)
    .order("year", { ascending: false });

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-70 flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span>GradeMaster</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-2">
          <DashboardNav ciclos={ciclos || []} />
        </div>

        <div className="mt-auto border-t p-4">
          <UserProfilePanel />
        </div>
      </aside>

      <div className="flex flex-col md:pl-70">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Navegación</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-auto py-2">
                <DashboardNav ciclos={ciclos || []} isMobile={true} />
              </div>
              <div className="mt-auto border-t p-4">
                <UserProfilePanel />
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full text-center font-semibold">GradeMaster</div>
        </header>

        <main className="flex-1 p-4 md:p-8 bg-background">{children}</main>
      </div>
    </div>
  );
}