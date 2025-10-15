// lib/groqClient.ts
import Groq from 'groq-sdk'

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY no está configurada en .env.local')
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Modelos disponibles actualizados (2025)
export const MODELS = {
  FAST: 'llama-3.3-70b-versatile', // Rápido y balanceado
  SMART: 'llama-3.3-70b-versatile', // Mismo modelo, es el mejor disponible
  MIXTRAL: 'mixtral-8x7b-32768', // Contexto largo
}