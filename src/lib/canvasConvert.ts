/**
 * Browser-native image conversion using the Canvas API.
 * Handles standard web formats (PNG, JPEG, WebP, BMP) instantly
 * without loading any WASM binaries.
 */

export interface CanvasConversionResult {
    file: File
    blob: Blob
    url: string
    filename: string
    originalSize: number
    outputSize: number
}

/**
 * Convert an image file to a different format using the browser's native Canvas API.
 * This is instant for standard web formats — no WASM required.
 */
export async function convertImageWithCanvas(
    file: File,
    targetExtension: string,
    targetMimeType: string,
    quality: number = 0.95
): Promise<CanvasConversionResult> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const objectUrl = URL.createObjectURL(file)

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas')
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    URL.revokeObjectURL(objectUrl)
                    reject(new Error('Failed to create canvas context'))
                    return
                }

                // For JPEG, fill white background first (PNG transparency → white)
                if (targetMimeType === 'image/jpeg' || targetMimeType === 'image/bmp') {
                    ctx.fillStyle = '#FFFFFF'
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                }

                ctx.drawImage(img, 0, 0)
                URL.revokeObjectURL(objectUrl)

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas conversion produced no output'))
                            return
                        }

                        const baseName = file.name.replace(/\.[^/.]+$/, '')
                        const outputFilename = `${baseName}_converted.${targetExtension}`
                        const outFile = new File([blob], outputFilename, { type: targetMimeType })

                        resolve({
                            file: outFile,
                            blob,
                            url: URL.createObjectURL(blob),
                            filename: outputFilename,
                            originalSize: file.size,
                            outputSize: blob.size,
                        })
                    },
                    targetMimeType,
                    // Quality only applies to lossy formats
                    targetMimeType === 'image/jpeg' || targetMimeType === 'image/webp' ? quality : undefined
                )
            } catch (err) {
                URL.revokeObjectURL(objectUrl)
                reject(err)
            }
        }

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('Failed to load image for conversion'))
        }

        img.src = objectUrl
    })
}
