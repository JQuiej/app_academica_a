// app/_actions/asistente.ts
'use server'

import { groq, MODELS } from '@/lib/groqClient'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// Acción para enviar mensaje al asistente
export async function sendMessageToAssistant(
  message: string,
  history: Message[] = []
) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente educativo útil. Ayudas a estudiantes con sus estudios, generas resúmenes, explicas conceptos y respondes preguntas de forma clara y concisa en español.'
        },
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ],
      model: MODELS.FAST,
      temperature: 0.7,
      max_tokens: 2048,
    })

    const response = completion.choices[0]?.message?.content || 'Sin respuesta'

    return {
      success: true,
      response,
      timestamp: Date.now()
    }
  } catch (error: any) {
    console.error('Error en sendMessageToAssistant:', error)
    return {
      success: false,
      error: error.message || 'Error al comunicarse con el asistente'
    }
  }
}

// Acción para generar resumen
export async function generarResumen(contenido: string) {
  try {
    // Verificar que hay contenido
    if (!contenido || contenido.trim().length === 0) {
      return {
        success: false,
        error: 'No hay contenido para generar el resumen'
      }
    }

    // Limitar el contenido a 10000 caracteres
    const textoLimitado = contenido.length > 10000 ? contenido.substring(0, 10000) : contenido

    console.log('📤 Generando resumen. Longitud del texto:', textoLimitado.length)

    const prompt = `Analiza el siguiente texto y genera un resumen completo y detallado.

Incluye:
1. Tema principal
2. Puntos clave (mínimo 5)
3. Conceptos importantes
4. Conclusiones

Formato: Markdown con títulos y bullets.

TEXTO A ANALIZAR:
${textoLimitado}`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en crear resúmenes académicos claros y concisos en español.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: MODELS.SMART,
      temperature: 0.5,
      max_tokens: 3000,
    })

    const resumen = completion.choices[0]?.message?.content || ''

    return {
      success: true,
      resumen,
      timestamp: Date.now()
    }
  } catch (error: any) {
    console.error('Error en generarResumen:', error)
    return {
      success: false,
      error: error.message || 'Error al generar resumen'
    }
  }
}

// Acción para generar cuestionario
export async function generarCuestionario(
  contenido: string,
  numeroPregutas: number = 10,
  dificultad: 'fácil' | 'media' | 'difícil' = 'media'
) {
  try {
    if (!contenido || contenido.trim().length === 0) {
      return {
        success: false,
        error: 'No hay contenido para generar el cuestionario'
      }
    }

    const textoLimitado = contenido.length > 10000 ? contenido.substring(0, 10000) : contenido

    console.log('📤 Generando cuestionario. Longitud del texto:', textoLimitado.length)

    const prompt = `Basándote en el siguiente texto, genera un cuestionario de ${numeroPregutas} preguntas de opción múltiple.

Dificultad: ${dificultad}

Formato ESTRICTO para cada pregunta:
## PREGUNTA [número]
[Texto de la pregunta]

A) [Opción A]
B) [Opción B]
C) [Opción C]
D) [Opción D]

**RESPUESTA CORRECTA:** [Letra]
**EXPLICACIÓN:** [Breve explicación]

---

Asegúrate de cubrir diferentes temas del documento.

TEXTO A ANALIZAR:
${textoLimitado}`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en pedagogía y creación de evaluaciones académicas en español.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: MODELS.SMART,
      temperature: 0.7,
      max_tokens: 4000,
    })

    const cuestionario = completion.choices[0]?.message?.content || ''

    return {
      success: true,
      cuestionario,
      timestamp: Date.now()
    }
  } catch (error: any) {
    console.error('Error en generarCuestionario:', error)
    return {
      success: false,
      error: error.message || 'Error al generar cuestionario'
    }
  }
}

// Acción para generar flashcards
export async function generarFlashcards(contenido: string) {
  try {
    const textoLimitado = contenido.length > 10000 ? contenido.substring(0, 10000) : contenido

    const prompt = `Genera 15 flashcards del contenido del siguiente texto.

Formato:
## FLASHCARD 1
**FRENTE:** [Pregunta o concepto]
**REVERSO:** [Respuesta o definición]

## FLASHCARD 2
...

Las flashcards deben cubrir los conceptos más importantes.

TEXTO:
${textoLimitado}`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en técnicas de estudio y memorización, especializado en crear flashcards efectivas en español.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: MODELS.SMART,
      temperature: 0.6,
      max_tokens: 3000,
    })

    const flashcards = completion.choices[0]?.message?.content || ''

    return {
      success: true,
      flashcards,
      timestamp: Date.now()
    }
  } catch (error: any) {
    console.error('Error en generarFlashcards:', error)
    return {
      success: false,
      error: error.message || 'Error al generar flashcards'
    }
  }
}