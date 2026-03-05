export type ImageEngine = 'canvas' | 'magick'
export type ImageConversionMode =
    | 'webp' | 'jpeg' | 'png' | 'bmp' // Standard formats -> Primary engine
    | 'tiff' | 'tga' | 'psd' | 'jxl' | 'avif' | 'eps' // Obscure/pro formats -> Magick

export interface ImageConversionProfile {
    id: ImageConversionMode
    engine: ImageEngine
    label: string
    description: string
    outputExtension: string
    mimeType: string
    acceptedInputs: string[]
}

export const IMAGE_PROFILES: Record<ImageConversionMode, ImageConversionProfile> = {
    // ---- Standard formats (fast, native-feeling for common web formats) ----
    webp: {
        id: 'webp',
        engine: 'canvas',
        label: 'Convert to WebP',
        description: 'Next-gen web format, great compression',
        outputExtension: 'webp',
        mimeType: 'image/webp',
        acceptedInputs: ['image/*'],
    },
    jpeg: {
        id: 'jpeg',
        engine: 'canvas',
        label: 'Convert to JPEG',
        description: 'Universal standard for photos',
        outputExtension: 'jpg',
        mimeType: 'image/jpeg',
        acceptedInputs: ['image/*'],
    },
    png: {
        id: 'png',
        engine: 'canvas',
        label: 'Convert to PNG',
        description: 'High quality, transparent backgrounds',
        outputExtension: 'png',
        mimeType: 'image/png',
        acceptedInputs: ['image/*'],
    },

    bmp: {
        id: 'bmp',
        engine: 'canvas',
        label: 'Convert to BMP',
        description: 'Uncompressed, lossless legacy format',
        outputExtension: 'bmp',
        mimeType: 'image/bmp',
        acceptedInputs: ['image/*'],
    },

    // ---- Professional formats (heavier processing for obscure/pro formats) ----
    tiff: {
        id: 'tiff',
        engine: 'magick',
        label: 'Convert to TIFF',
        description: 'High quality professional printing format',
        outputExtension: 'tiff',
        mimeType: 'image/tiff',
        acceptedInputs: ['image/*'],
    },
    psd: {
        id: 'psd',
        engine: 'magick',
        label: 'Convert to PSD',
        description: 'Adobe Photoshop Document format',
        outputExtension: 'psd',
        mimeType: 'image/vnd.adobe.photoshop',
        acceptedInputs: ['image/*'],
    },
    tga: {
        id: 'tga',
        engine: 'magick',
        label: 'Convert to TGA',
        description: 'Truevision Targa graphic format',
        outputExtension: 'tga',
        mimeType: 'image/x-tga',
        acceptedInputs: ['image/*'],
    },

    jxl: {
        id: 'jxl',
        engine: 'magick',
        label: 'Convert to JXL',
        description: 'JPEG XL latest standardized format',
        outputExtension: 'jxl',
        mimeType: 'image/jxl',
        acceptedInputs: ['image/*'],
    },
    avif: {
        id: 'avif',
        engine: 'magick',
        label: 'Convert to AVIF',
        description: 'AV1 Image File Format',
        outputExtension: 'avif',
        mimeType: 'image/avif',
        acceptedInputs: ['image/*'],
    },
    eps: {
        id: 'eps',
        engine: 'magick',
        label: 'Convert to EPS',
        description: 'Encapsulated PostScript vector format',
        outputExtension: 'eps',
        mimeType: 'application/postscript',
        acceptedInputs: ['image/*'],
    }
}
