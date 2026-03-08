import { useState, useCallback, useRef } from 'react'

export interface MagickConversionResult {
    file: File;
    blob: Blob;
    url: string;
    filename: string;
}

let magickInitialized = false;

export function useMagick() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready'>('idle')
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)

    // We use a ref to manage abort state
    const abortRef = useRef<AbortController | null>(null)

    const load = useCallback(async () => {
        if (magickInitialized) {
            setStatus('ready')
            return
        }

        try {
            setStatus('loading')
            setError(null)

            // Dynamic import to avoid loading the massive binary on first page load
            const { initializeImageMagick } = await import('@imagemagick/magick-wasm')

            // Fetch the binary from the public folder
            const origin = window.location.origin;
            const wasmUrl = new URL(`${origin}/magick/magick.wasm`);

            await initializeImageMagick(wasmUrl)

            magickInitialized = true
            setStatus('ready')
        } catch (err: any) {
            console.error('Failed to load conversion engine:', err)
            setError('Failed to load the conversion engine. Please refresh and try again.')
            setStatus('idle')
        }
    }, [])

    const convert = useCallback(async (
        file: File,
        targetExtension: string,
        targetMimeType: string,
        quality?: number
    ): Promise<MagickConversionResult> => {

        if (!magickInitialized) {
            await load()
        }

        abortRef.current = new AbortController()

        try {
            setProgress(0)
            setError(null)

            const { ImageMagick, MagickFormat } = await import('@imagemagick/magick-wasm')

            const arrayBuffer = await file.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer)

            // Map common extension strings to MagickFormat enums roughly
            const formatMap: Record<string, any> = {
                'tiff': MagickFormat.Tiff,
                'psd': MagickFormat.Psd,
                'tga': MagickFormat.Tga,
                'heic': MagickFormat.Heic,
                'jxl': MagickFormat.Jxl,
                'avif': MagickFormat.Avif,
                'eps': MagickFormat.Eps,
                // Fallbacks just in case
                'jpg': MagickFormat.Jpeg,
                'jpeg': MagickFormat.Jpeg,
                'png': MagickFormat.Png,
                'webp': MagickFormat.WebP,
                'bmp': MagickFormat.Bmp,
                'gif': MagickFormat.Gif
            }

            const targetFormatEnum = formatMap[targetExtension.toLowerCase()] || MagickFormat.Unknown

            setProgress(10) // Reading completed

            if (abortRef.current?.signal.aborted) throw new Error('Cancelled')

            // Perform the conversion using the library's built-in promise resolution
            const outData = await ImageMagick.read(uint8Array, async (image) => {
                setProgress(50) // Processing

                if (abortRef.current?.signal.aborted) {
                    throw new Error('Cancelled')
                }

                // Preserve maximum quality for all conversions where applicable, unless specified
                if (quality !== undefined) {
                    image.quality = quality;
                }

                // .write() also takes a callback and returns what the callback returns (or Promise)
                return image.write(targetFormatEnum, (data) => {
                    // Copy the data out of the WebAssembly memory otherwise it gets garbage collected
                    setProgress(90) // Writing completed
                    return new Uint8Array(data)
                })
            })

            if (!outData || outData.length === 0) {
                throw new Error("Conversion failed to produce output data.")
            }

            if (abortRef.current?.signal.aborted) throw new Error('Cancelled')

            const blob = new Blob([outData], { type: targetMimeType })
            const url = URL.createObjectURL(blob)

            const originalName = file.name
            const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName
            const outputFilename = `${baseName}.${targetExtension}`

            const outFile = new File([blob], outputFilename, { type: targetMimeType })

            setProgress(100)

            return {
                file: outFile,
                blob,
                url,
                filename: outputFilename
            }

        } catch (err: any) {
            console.error('Conversion error:', err)
            const msg = err.message || String(err)
            if (msg !== 'Cancelled') setError(`Conversion failed: ${msg}`)
            throw new Error(msg)
        } finally {
            abortRef.current = null
        }
    }, [load])

    const cancel = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort()
            abortRef.current = null
        }
    }, [])

    const reset = useCallback(() => {
        setError(null)
        setProgress(0)
        cancel()
    }, [cancel])

    return {
        status,
        error,
        progress,
        load,
        convert,
        cancel,
        reset
    }
}
