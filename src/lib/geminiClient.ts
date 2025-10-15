import { GoogleGenerativeAI } from '@google/generative-ai'

// --> AÑADE ESTA LÍNEA AQUÍ <--
console.log(`[geminiClient.ts] La API Key es: ${process.env.GEMINI_API_KEY}`);


// Y esta también es crucial:
console.log(`[geminiClient.ts] La API Key es: ${process.env.GEMINI_API_KEY}`);
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY no está configurada en .env.local')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash'
})

export const geminiProModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-pro'
})