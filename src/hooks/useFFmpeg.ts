import { useRef, useState, useCallback } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import type { ConversionMode, ConversionOptions } from '../lib/conversionProfiles'
import { PROFILES } from '../lib/conversionProfiles'
import type { ImageConversionMode } from '../lib/imageConversionProfiles'
import { IMAGE_PROFILES } from '../lib/imageConversionProfiles'

export type FFmpegStatus = 'idle' | 'loading' | 'ready' | 'converting' | 'done' | 'error'

export interface ConversionResult {
    blob: Blob
    url: string
    filename: string
    originalSize: number
    outputSize: number
}

export interface UseFFmpegReturn {
    status: FFmpegStatus
    progress: number
    logMessages: string[]
    result: ConversionResult | null
    error: string | null
    load: () => Promise<void>
    convert: (file: File, mode: ConversionMode, options: ConversionOptions) => Promise<ConversionResult>
    convertImage: (file: File, mode: ImageConversionMode) => Promise<ConversionResult>
    cancel: () => void
    reset: () => void
}

export function useFFmpeg(): UseFFmpegReturn {
    const ffmpegRef = useRef<FFmpeg | null>(null)
    const loadingRef = useRef<Promise<void> | null>(null)
    const [status, setStatus] = useState<FFmpegStatus>('idle')
    const [progress, setProgress] = useState(0)
    const [logMessages, setLogMessages] = useState<string[]>([])
    const [result, setResult] = useState<ConversionResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const appendLog = useCallback((msg: string) => {
        setLogMessages(prev => [...prev.slice(-49), msg])
    }, [])

    const load = useCallback(async () => {
        if (ffmpegRef.current) return
        if (loadingRef.current) {
            await loadingRef.current
            return
        }

        setStatus('loading')
        appendLog('Loading conversion engine...')

        const doLoad = async () => {
            const ffmpeg = new FFmpeg()
            ffmpegRef.current = ffmpeg

            ffmpeg.on('log', ({ message }) => {
                // Filter out lines that reveal underlying technology
                const lower = message.toLowerCase()
                if (lower.includes('ffmpeg') || lower.includes('libav') || lower.includes('built with') ||
                    lower.includes('configuration:') || lower.includes('gcc') || lower.includes('copyright') ||
                    lower.includes('github') || lower.includes('wasm')) return
                appendLog(message)
            })
            ffmpeg.on('progress', ({ progress: p }) => {
                setProgress(Math.min(99, Math.round(p * 100)))
            })

            // Single-thread core served from public/ffmpeg/
            const origin = window.location.origin
            appendLog('Initializing...')
            await ffmpeg.load({
                coreURL: `${origin}/ffmpeg/ffmpeg-core.js`,
                wasmURL: `${origin}/ffmpeg/ffmpeg-core.wasm`,
            })

            appendLog('Ready.')
            setStatus('ready')
        }

        loadingRef.current = doLoad().catch(err => {
            const msg = err instanceof Error ? err.message : 'Failed to load conversion engine'
            setError(msg)
            setStatus('error')
            appendLog(`Error: ${msg}`)
            ffmpegRef.current = null
        }).finally(() => {
            loadingRef.current = null
        })

        await loadingRef.current
    }, [appendLog])

    // ---- Video / Audio Conversion ----
    const convert = useCallback(async (file: File, mode: ConversionMode, options: ConversionOptions): Promise<ConversionResult> => {
        if (!ffmpegRef.current) await load()
        if (!ffmpegRef.current) throw new Error("Conversion engine failed to load")

        const ffmpeg = ffmpegRef.current
        const profile = PROFILES[mode]

        setStatus('converting')
        setProgress(0)
        setResult(null)
        setError(null)

        try {
            const inputExt = (file.name.split('.').pop() || 'mp4').toLowerCase()
            const inputName = `input.${inputExt}`
            const outputName = `output.${profile.outputExtension}`

            appendLog(`Reading ${file.name} (${(file.size / 1024).toFixed(0)} KB)...`)
            const fileData = await fetchFile(file)
            appendLog('Writing to virtual filesystem...')
            await ffmpeg.writeFile(inputName, fileData)

            const args = ['-i', inputName, ...profile.buildArgs(options), outputName]
            appendLog(`Running conversion: ${args.join(' ').replace(/ffmpeg/gi, 'engine')}`)
            await ffmpeg.exec(args)

            appendLog('Reading output...')
            const data = await ffmpeg.readFile(outputName)
            const bytes = data instanceof Uint8Array
                ? data.slice()
                : new Uint8Array(data as unknown as ArrayBuffer).slice()
            const blob = new Blob([bytes.buffer as ArrayBuffer], { type: profile.mimeType })
            const url = URL.createObjectURL(blob)

            await ffmpeg.deleteFile(inputName).catch(() => { })
            await ffmpeg.deleteFile(outputName).catch(() => { })

            const baseName = file.name.replace(/\.[^/.]+$/, '')
            const conversionResult: ConversionResult = {
                blob, url,
                filename: `${baseName}_convertfiles.${profile.outputExtension}`,
                originalSize: file.size,
                outputSize: blob.size,
            }

            setResult(conversionResult)
            setProgress(100)
            setStatus('done')
            appendLog('Done!')
            return conversionResult
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Conversion failed'
            if (msg.includes('abort') || msg.includes('cancel') || msg.includes('terminated')) {
                setStatus('ready')
                appendLog('Cancelled.')
                throw new Error('Cancelled')
            }
            setError(msg)
            setStatus('error')
            appendLog(`Error: ${msg}`)
            throw err
        }
    }, [load, appendLog])


    // ---- Standard Image Conversion (No complex options needed, FFmpeg handles defaults perfectly) ----
    const convertImage = useCallback(async (file: File, mode: ImageConversionMode): Promise<ConversionResult> => {
        if (!ffmpegRef.current) await load()
        if (!ffmpegRef.current) throw new Error("Conversion engine failed to load")

        const ffmpeg = ffmpegRef.current
        const profile = IMAGE_PROFILES[mode]

        setStatus('converting')
        setProgress(0)
        setResult(null)
        setError(null)

        try {
            const inputExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
            const inputName = `input.${inputExt}`
            const outputName = `output.${profile.outputExtension}`

            appendLog(`Reading image ${file.name} (${(file.size / 1024).toFixed(0)} KB)...`)
            const fileData = await fetchFile(file)
            await ffmpeg.writeFile(inputName, fileData)

            // For images, an empty option args array is usually perfectly fine, it infers everything.
            // GIF needs some special handling for looping if it's animated, but simple conversions are fine.
            let args: string[] = ['-i', inputName]

            if (mode === 'webp') {
                args = ['-i', inputName, '-c:v', 'libwebp', '-q:v', '75', outputName]
            } else if (mode === 'jpeg') {
                // -q:v 2 = near-lossless quality (scale 2-31, lower is better)
                args = ['-i', inputName, '-q:v', '2', outputName]
            } else if (mode === 'png') {
                // PNG is lossless, no quality flag needed but ensure no compression artifacts
                args = ['-i', inputName, '-compression_level', '3', outputName]
            } else {
                args = ['-i', inputName, outputName]
            }

            appendLog(`Running image conversion...`)
            await ffmpeg.exec(args)

            appendLog('Reading output...')
            const data = await ffmpeg.readFile(outputName)
            const bytes = data instanceof Uint8Array
                ? data.slice()
                : new Uint8Array(data as unknown as ArrayBuffer).slice()
            const blob = new Blob([bytes.buffer as ArrayBuffer], { type: profile.mimeType })
            const url = URL.createObjectURL(blob)

            await ffmpeg.deleteFile(inputName).catch(() => { })
            await ffmpeg.deleteFile(outputName).catch(() => { })

            const baseName = file.name.replace(/\.[^/.]+$/, '')
            const conversionResult: ConversionResult = {
                blob, url,
                filename: `${baseName}_converted.${profile.outputExtension}`,
                originalSize: file.size,
                outputSize: blob.size,
            }

            setResult(conversionResult)
            setProgress(100)
            setStatus('done')
            appendLog('Done!')
            return conversionResult
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Image Conversion failed'
            if (msg.includes('abort') || msg.includes('cancel') || msg.includes('terminated')) {
                setStatus('ready')
                appendLog('Cancelled.')
                throw new Error('Cancelled')
            }
            setError(msg)
            setStatus('error')
            appendLog(`Error: ${msg}`)
            throw err
        }
    }, [load, appendLog])

    const cancel = useCallback(() => {
        ffmpegRef.current?.terminate()
        ffmpegRef.current = null
        loadingRef.current = null
        setStatus('idle')
        setProgress(0)
        appendLog('Cancelled.')
    }, [appendLog])

    const reset = useCallback(() => {
        if (result?.url) URL.revokeObjectURL(result.url)
        setStatus(ffmpegRef.current ? 'ready' : 'idle')
        setProgress(0)
        setResult(null)
        setError(null)
        setLogMessages([])
    }, [result])

    return { status, progress, logMessages, result, error, load, convert, convertImage, cancel, reset }
}
