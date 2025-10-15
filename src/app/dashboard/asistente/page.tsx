// app/dashboard/asistente/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { sendMessageToAssistant, generarResumen, generarCuestionario, generarFlashcards, Message } from '@/app/_actions/asistente'
import { Send, Paperclip, Download, Loader2, FileText, Brain, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'

export default function AsistentePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string>('')
  const [fileText, setFileText] = useState<string>('')
  
  // Estados para generación de contenido
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [numeroPreguntas, setNumeroPreguntas] = useState(10)
  const [dificultad, setDificultad] = useState<'fácil' | 'media' | 'difícil'>('media')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type

    // Si es texto plano
    if (fileType === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsText(file)
      })
    }

    // Si es PDF
    if (fileType === 'application/pdf') {
      return new Promise(async (resolve, reject) => {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const pdfjsLib = await import('pdfjs-dist')
          
          // Configurar worker
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
          
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          let fullText = ''
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item: any) => item.str).join(' ')
            fullText += pageText + '\n\n'
          }
          
          resolve(fullText)
        } catch (error) {
          reject(error)
        }
      })
    }

    // Si es imagen (OCR con Tesseract)
    if (fileType.startsWith('image/')) {
      return new Promise(async (resolve, reject) => {
        try {
          const { createWorker } = await import('tesseract.js')
          const worker = await createWorker('spa') // Español
          
          const { data: { text } } = await worker.recognize(file)
          await worker.terminate()
          
          resolve(text)
        } catch (error) {
          reject(error)
        }
      })
    }

    throw new Error('Tipo de archivo no soportado')
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es muy grande. Máximo 10MB.')
      return
    }

    // Validar tipo
    const allowedTypes = [
      'text/plain', 
      'text/markdown', 
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ]
    
    const isAllowed = allowedTypes.includes(file.type) || 
                     file.name.endsWith('.txt') || 
                     file.name.endsWith('.md')
    
    if (!isAllowed) {
      toast.error('Tipo de archivo no soportado. Usa TXT, PDF o imágenes.')
      return
    }

    try {
      toast.loading('Procesando archivo...')
      const text = await extractTextFromFile(file)
      
      if (!text || text.trim().length === 0) {
        toast.error('No se pudo extraer texto del archivo')
        return
      }
      
      setSelectedFile(file)
      setFilePreview(file.name)
      setFileText(text)
      toast.success('Archivo cargado exitosamente')
    } catch (error) {
      console.error('Error al procesar archivo:', error)
      toast.error('Error al leer el archivo')
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return

    let fullMessage = inputMessage
    if (selectedFile && fileText) {
      fullMessage = `${inputMessage}\n\n[Contenido del archivo ${selectedFile.name}]:\n${fileText.substring(0, 3000)}...`
    }

    const userMessage: Message = {
      role: 'user',
      content: selectedFile ? `${inputMessage}\n[Archivo: ${selectedFile.name}]` : inputMessage,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const result = await sendMessageToAssistant(fullMessage, messages)

      if (result.success && result.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: result.response,
          timestamp: result.timestamp
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        toast.error(result.error || 'Error al enviar mensaje')
      }
    } catch (error) {
      toast.error('Error al comunicarse con el asistente')
    } finally {
      setIsLoading(false)
      setSelectedFile(null)
      setFilePreview('')
      setFileText('')
    }
  }

  const handleGenerateContent = async (type: 'resumen' | 'cuestionario' | 'flashcards') => {
    if (!selectedFile || !fileText) {
      toast.error('Primero selecciona un archivo')
      return
    }

    // Verificar que hay texto
    if (fileText.trim().length === 0) {
      toast.error('El archivo está vacío o no se pudo extraer texto')
      return
    }

    console.log('📝 Contenido a enviar (primeros 200 chars):', fileText.substring(0, 200))

    setIsGenerating(true)
    setGeneratedContent('')

    try {
      let result
      if (type === 'resumen') {
        result = await generarResumen(fileText)
        if (result.success) setGeneratedContent(result.resumen!)
      } else if (type === 'cuestionario') {
        result = await generarCuestionario(fileText, numeroPreguntas, dificultad)
        if (result.success) setGeneratedContent(result.cuestionario!)
      } else {
        result = await generarFlashcards(fileText)
        if (result.success) setGeneratedContent(result.flashcards!)
      }

      if (!result.success) {
        toast.error(result.error || 'Error al generar contenido')
      } else {
        toast.success('Contenido generado exitosamente')
      }
    } catch (error) {
      console.error('Error en handleGenerateContent:', error)
      toast.error('Error al procesar archivo')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedContent) return

    const blob = new Blob([generatedContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contenido-generado-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Contenido descargado')
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Asistente de Estudio IA</h1>
        <p className="text-muted-foreground">
          Chatea con IA, genera resúmenes, cuestionarios y más
        </p>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat con IA</TabsTrigger>
          <TabsTrigger value="generar">Generar Contenido</TabsTrigger>
        </TabsList>

        {/* TAB: Chat */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Conversación
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Haz una pregunta o sube un archivo para comenzar</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="space-y-2">
                {filePreview && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm flex-1 truncate">{filePreview}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedFile(null)
                        setFilePreview('')
                        setFileText('')
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".txt,.md,.pdf,image/*"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Generar Contenido */}
        <TabsContent value="generar" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Archivo (TXT, PDF o Imagen)</Label>
                  <input
                    type="file"
                    className="hidden"
                    id="file-generate"
                    accept=".txt,.md,.pdf,image/*"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="file-generate">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      {selectedFile ? (
                        <>
                          <FileText className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(0)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">Haz clic para seleccionar</p>
                          <p className="text-xs text-muted-foreground mt-1">TXT, PDF o imágenes</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>Número de Preguntas (Cuestionario)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="30"
                    value={numeroPreguntas}
                    onChange={(e) => setNumeroPreguntas(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dificultad</Label>
                  <Select value={dificultad} onValueChange={(v: any) => setDificultad(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fácil">Fácil</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="difícil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => handleGenerateContent('resumen')}
                    disabled={!selectedFile || isGenerating}
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                    Generar Resumen
                  </Button>
                  <Button
                    onClick={() => handleGenerateContent('cuestionario')}
                    disabled={!selectedFile || isGenerating}
                    variant="outline"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                    Generar Cuestionario
                  </Button>
                  <Button
                    onClick={() => handleGenerateContent('flashcards')}
                    disabled={!selectedFile || isGenerating}
                    variant="outline"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Generar Flashcards
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Contenido Generado</CardTitle>
                {generatedContent && (
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none max-h-[500px] overflow-y-auto">
                    <ReactMarkdown>{generatedContent}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>El contenido generado aparecerá aquí</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}