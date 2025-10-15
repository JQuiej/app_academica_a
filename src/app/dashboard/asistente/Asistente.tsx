"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Msg = { role: "user" | "assistant"; content: string };

export default function Asistente({ cicloId }: { cicloId?: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  // Al cargar, pedir directamente las próximas tareas
  useEffect(() => {
    async function fetchTareas() {
      try {
        const res = await fetch("/api/asistente", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [], context: { cicloId } }),
        });
        const data = await res.json();
        setMessages([{ role: "assistant", content: data.reply }]);
      } catch {
        setMessages([{ role: "assistant", content: "Hubo un error al consultar tus tareas." }]);
      } finally {
        setLoading(false);
      }
    }
    fetchTareas();
  }, [cicloId]);

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-lg h-[400px] flex flex-col shadow-md">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted text-foreground">
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted text-foreground">
                Consultando próximas tareas…
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}