import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("❌ La clave GEMINI_API_KEY no está definida en .env.local");
  }

  const genAI = new GoogleGenAI({ apiKey });

  const response = await genAI.models.generateContent({
    model: "gemini-1.5-flash", // o "gemini-2.5-flash" si tienes acceso
    contents: "Di solo: funcionó",
  });

  console.log("📨 Respuesta:", response.text ?? "❌ Falló");
}

main();