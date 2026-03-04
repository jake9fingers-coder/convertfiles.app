import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import type { DocumentConversionMode } from '../lib/documentConversionProfiles'

// Ensure we point pdfjs to the correct worker in the public path.
// Vite requires setting the GlobalWorkerOptions workerSrc manually.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface DocumentConversionResult {
    blob: Blob
    filename: string
    url: string
}

/**
 * Renders a PDF page to a PNG Blob using HTML Canvas
 */
async function renderPageToImageBlob(page: pdfjsLib.PDFPageProxy, scale: number = 2.0): Promise<Blob> {
    const viewport = page.getViewport({ scale })

    // Create an off-screen canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error("Could not create canvas context for PDF rendering")

    canvas.width = viewport.width
    canvas.height = viewport.height

    const renderContext = {
        canvasContext: ctx,
        transform: [scale, 0, 0, scale, 0, 0],
        viewport: viewport
    }

    await page.render(renderContext as any).promise

    return new Promise((resolve, reject) => {
        // High quality JPEG
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob)
                else reject(new Error("Canvas toBlob failed"))
            },
            'image/jpeg',
            1.0
        )
    })
}

export async function convertDocumentFile(
    files: File[], // Multiple for images->pdf, single for pdf->images
    mode: DocumentConversionMode,
    onProgress?: (val: number) => void
): Promise<DocumentConversionResult> {

    if (mode === 'images_to_pdf') {
        const pdfDoc = await PDFDocument.create()

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const bytes = await file.arrayBuffer()

            let image;
            const type = file.type.toLowerCase()

            if (type === 'image/jpeg' || type === 'image/jpg') {
                image = await pdfDoc.embedJpg(bytes)
            } else if (type === 'image/png') {
                image = await pdfDoc.embedPng(bytes)
            } else {
                throw new Error(`Unsupported image format for PDF merge: ${type}`)
            }

            const page = pdfDoc.addPage([image.width, image.height])
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            })

            if (onProgress) onProgress(((i + 1) / files.length) * 100)
        }

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        return {
            blob,
            filename: 'merged_images.pdf',
            url
        }

    } else if (mode === 'pdf_to_images') {
        if (files.length !== 1) {
            throw new Error("PDF to Image conversion expects exactly 1 PDF file.")
        }

        const file = files[0]
        const arrayBuffer = await file.arrayBuffer()

        // Load PDF using pdf.js
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer))
        const pdf = await loadingTask.promise

        const numPages = pdf.numPages
        const zip = new JSZip()
        const imageFolder = zip.folder("pdf_images")

        if (!imageFolder) throw new Error("Could not create ZIP folder")

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i)
            const imgBlob = await renderPageToImageBlob(page)

            // Format name e.g., page_01.jpg
            const pageStr = String(i).padStart(String(numPages).length, '0')
            imageFolder.file(`page_${pageStr}.jpg`, imgBlob)

            if (onProgress) onProgress((i / numPages) * 100)
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)

        const originalName = file.name.split('.').slice(0, -1).join('.')
        return {
            blob: zipBlob,
            filename: `${originalName || 'document'}_images.zip`,
            url
        }
    }

    throw new Error(`Unsupported document conversion mode: ${mode}`)
}
