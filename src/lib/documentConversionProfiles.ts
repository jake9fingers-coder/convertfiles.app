export type DocumentConversionMode = 'pdf_to_images' | 'images_to_pdf'

export interface DocumentConversionProfile {
    mode: DocumentConversionMode
    label: string
    description: string
    icon: string
    acceptedTypes: string
    outputExt: string
}

export const DOCUMENT_PROFILES: Record<DocumentConversionMode, DocumentConversionProfile> = {
    pdf_to_images: {
        mode: 'pdf_to_images',
        label: 'PDF to JPG',
        description: 'Extract all pages as high-quality JPG images',
        icon: '📄➡️🖼️',
        acceptedTypes: '.pdf,application/pdf',
        outputExt: 'zip', // Bundles them
    },
    images_to_pdf: {
        mode: 'images_to_pdf',
        label: 'Images to PDF',
        description: 'Combine multiple images into a single PDF document',
        icon: '🖼️➡️📄',
        acceptedTypes: 'image/*',
        outputExt: 'pdf'
    }
}
