// Archivo: src/app/api/extract-text/route.ts
import { NextResponse } from 'next/server';
import PDFParser from "pdf2json";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // La librería pdf2json funciona con promesas y eventos
    const pdfParser = new (PDFParser as any)(null, 1);

    const text = await new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("Error en pdf2json:", errData.parserError);
        reject(new Error("Error al leer el PDF."));
      });
      
      pdfParser.on("pdfParser_dataReady", () => {
        // Extraemos y unimos todo el texto de todas las páginas
        const extractedText = pdfParser.getRawTextContent();
        resolve(extractedText);
      });

      pdfParser.parseBuffer(fileBuffer);
    });

    return NextResponse.json({ text });

  } catch (error) {
    console.error('Error al procesar el PDF:', error);
    return NextResponse.json({ error: 'No se pudo procesar el archivo PDF.' }, { status: 500 });
  }
}