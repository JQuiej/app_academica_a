// scripts/testGroq.ts
import Groq from 'groq-sdk';
import { env } from 'process';

// Reemplaza con tu API key de Groq
const API_KEY = env.GROQ_API_KEY;

const groq = new Groq({
  apiKey: API_KEY,
});

async function testGroq() {
  try {
    console.log("🧪 Probando conexión con Groq...\n");
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un asistente útil y conciso."
        },
        {
          role: "user",
          content: "Di solo: funciono perfectamente"
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 100,
    });

    const respuesta = completion.choices[0]?.message?.content;

    console.log("✅ ¡ÉXITO! Groq está funcionando");
    console.log("📨 Respuesta:", respuesta);
    console.log("\n📊 Estadísticas:");
    console.log("   - Tokens usados:", completion.usage?.total_tokens);
    console.log("   - Modelo:", completion.model);
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

testGroq();