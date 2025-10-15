import { env } from "process";

// scripts/testGemini.ts
const API_KEY = env.Gemini_API_KEY;

async function testGemini() {
  const modelos = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  for (const modelo of modelos) {
    try {
      console.log(`\n🧪 Probando: ${modelo}`);
      
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelo}:generateContent?key=${API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Di solo: funciono" }]
          }]
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ¡ÉXITO con: ${modelo}!`);
        console.log(`📨 Respuesta:`, data.candidates[0].content.parts[0].text);
        return;
      } else {
        console.log(`❌ Error:`, data.error?.message || 'Modelo no disponible');
      }
      
    } catch (error: any) {
      console.log(`❌ Error:`, error.message);
    }
  }
}

testGemini();