import { useState, useCallback, useEffect } from 'react'
import SEOHead from '../components/SEOHead'
import { SITE_URL } from '../lib/seoConversionData'
import JSZip from 'jszip'
import { useFFmpeg, type ConversionResult } from '../hooks/useFFmpeg'
import { useMagick, type MagickConversionResult } from '../hooks/useMagick'
import type { ImageConversionMode } from '../lib/imageConversionProfiles'
import { IMAGE_PROFILES } from '../lib/imageConversionProfiles'
import Dropzone from '../components/Dropzone'
import ProgressDisplay from '../components/ProgressDisplay'
import BatchImageConversionList from '../components/BatchImageConversionList'
import ConversionHistoryList from '../components/ConversionHistoryList'
import { saveImageHistory, loadImageHistory } from '../lib/db'
import heic2any from 'heic2any'

export interface BatchImageItem {
    id: string
    file: File
    mode: ImageConversionMode
    status: 'pending' | 'converting' | 'done' | 'error'
    progress: number
    result: ConversionResult | MagickConversionResult | null
    error: string | null
}

import Features from '../components/Features'
import RelatedTools from '../components/RelatedTools'

export default function ImageConverter({ embedded = false }: { embedded?: boolean }) {
    // --- Dual Engines ---
    const ffmpeg = useFFmpeg()
    const magick = useMagick()

    const [batch, setBatch] = useState<BatchImageItem[]>([])
    const [history, setHistory] = useState<BatchImageItem[]>([])
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)
    const [isConvertingBatch, setIsConvertingBatch] = useState(false)
    const [isZipping, setIsZipping] = useState(false)

    // Load history on mount
    useEffect(() => {
        loadImageHistory().then(data => {
            setHistory(data)
            setIsHistoryLoaded(true)
        })
    }, [])

    // Sync history to IndexedDB when it changes
    useEffect(() => {
        if (isHistoryLoaded) {
            saveImageHistory(history)
        }
    }, [history, isHistoryLoaded])

    // Sync progress from whichever engine is currently active
    // We determine the active engine by looking at which item is currently converting
    useEffect(() => {
        if (isConvertingBatch) {
            setBatch(prev => {
                const activeItem = prev.find(p => p.status === 'converting')
                if (!activeItem) return prev;

                const profile = IMAGE_PROFILES[activeItem.mode]
                const activeProgress = profile.engine === 'ffmpeg' ? ffmpeg.progress : magick.progress

                return prev.map(p => p.status === 'converting' ? { ...p, progress: activeProgress } : p)
            })
        }
    }, [ffmpeg.progress, magick.progress, isConvertingBatch])

    const handleFiles = useCallback((incomingFiles: File[]) => {
        const finishedItems = batch.filter(i => i.status === 'done' || i.status === 'error')
        if (finishedItems.length > 0) {
            setHistory(h => [...finishedItems, ...h])
        }

        ffmpeg.reset()
        magick.reset()

        const newBatch = incomingFiles.map(f => ({
            id: crypto.randomUUID(),
            file: f,
            mode: 'webp' as ImageConversionMode, // Default
            status: 'pending' as const,
            progress: 0,
            result: null,
            error: null
        }))

        setBatch(newBatch)

        // Prewarm both engines if possible
        ffmpeg.load()
        magick.load()
    }, [batch, ffmpeg.reset, magick.reset, ffmpeg.load, magick.load])

    const updateAllItems = useCallback((updates: Partial<BatchImageItem>) => {
        setBatch(prev => prev.map(p => ({ ...p, ...updates })))
    }, [])

    const removeItem = useCallback((id: string) => {
        setBatch(prev => prev.filter(p => p.id !== id))
    }, [])

    const handleConvertBatch = useCallback(async () => {
        setIsConvertingBatch(true)

        try {
            for (let i = 0; i < batch.length; i++) {
                const item = batch[i]
                if (item.status === 'done' || item.status === 'converting') continue

                const profile = IMAGE_PROFILES[item.mode]
                const inputExt = (item.file.name.split('.').pop() || '').toLowerCase()
                const outputExt = profile.outputExtension.toLowerCase()

                if (inputExt === outputExt) {
                    setBatch(prev => prev.map(p => p.id === item.id ? {
                        ...p,
                        status: 'error',
                        error: `Already a .${outputExt.toUpperCase()} file`
                    } : p))
                    continue
                }

                setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'converting', error: null } : p))

                try {
                    let res: ConversionResult | MagickConversionResult;
                    let fileToConvert = item.file;

                    if ((inputExt === 'heic' || inputExt === 'heif') && profile.engine === 'ffmpeg') {
                        // Check if browser already considers this file readable (some .heic files
                        // are JPEG-wrapped and get assigned image/jpeg MIME type by the OS)
                        const browserMime = (item.file.type || '').toLowerCase();
                        const isBrowserReadable = browserMime.startsWith('image/jpeg') || browserMime.startsWith('image/png') || browserMime.startsWith('image/webp');

                        if (isBrowserReadable) {
                            // Browser can already read this — skip decoding
                            const readableExt = browserMime.includes('jpeg') ? 'jpg' : browserMime.includes('png') ? 'png' : 'webp';
                            const newName = item.file.name.replace(/\.heic$/i, `.${readableExt}`).replace(/\.heif$/i, `.${readableExt}`);

                            // If the target format matches what the browser already sees, return directly — no re-encoding needed
                            if (browserMime === profile.mimeType || (browserMime === 'image/jpeg' && profile.mimeType === 'image/jpeg')) {
                                const blob = new Blob([item.file], { type: browserMime });
                                const baseName = item.file.name.replace(/\.[^/.]+$/, '');
                                const outputName = `${baseName}_converted.${profile.outputExtension}`;
                                res = {
                                    file: new File([blob], outputName, { type: browserMime }),
                                    blob,
                                    url: URL.createObjectURL(blob),
                                    filename: outputName,
                                    originalSize: item.file.size,
                                    outputSize: blob.size,
                                } as ConversionResult;

                                setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'done', progress: 100, result: res! } : p));
                                continue;
                            }

                            // Different target format — rename and let engine convert (e.g. browser-JPEG → WebP)
                            fileToConvert = new File([item.file], newName, { type: browserMime });
                        } else {
                            // Genuine HEIC — decode first
                            try {
                                const isJpeg = profile.mimeType === 'image/jpeg';
                                const toType = isJpeg ? 'image/jpeg' : 'image/png';

                                const converted = await heic2any({
                                    blob: item.file,
                                    toType,
                                    quality: isJpeg ? 1 : undefined
                                });

                                const blob = Array.isArray(converted) ? converted[0] : converted;
                                const newName = item.file.name.replace(/\.heic$/i, isJpeg ? '.jpg' : '.png').replace(/\.heif$/i, isJpeg ? '.jpg' : '.png');

                                // If the target format matches, we're done — no need for additional conversion
                                if (profile.mimeType === toType && (profile.id as string) !== 'webp' && (profile.id as string) !== 'gif' && (profile.id as string) !== 'bmp') {
                                    const finalFile = new File([blob], newName, { type: toType });
                                    res = {
                                        file: finalFile,
                                        blob,
                                        url: URL.createObjectURL(blob),
                                        filename: newName,
                                        originalSize: item.file.size,
                                        outputSize: finalFile.size
                                    } as ConversionResult;

                                    setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'done', progress: 100, result: res! } : p));
                                    continue;
                                }

                                // For WebP/BMP/etc, use the decoded image and let engine finish
                                fileToConvert = new File([blob], item.file.name.replace(/\.heic$/i, '.png').replace(/\.heif$/i, '.png'), { type: 'image/png' });
                            } catch (heicErr: any) {
                                const heicMsg = heicErr.message || String(heicErr);
                                // If decoder says "already browser readable", just use file as-is
                                if (heicMsg.includes('already browser readable')) {
                                    const newName = item.file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
                                    fileToConvert = new File([item.file], newName, { type: 'image/jpeg' });
                                } else {
                                    throw new Error(`Could not decode HEIC file: ${heicMsg}`);
                                }
                            }
                        }
                    }

                    if (profile.engine === 'ffmpeg') {
                        res = await ffmpeg.convertImage(fileToConvert, profile.id)
                    } else {
                        res = await magick.convert(fileToConvert, profile.outputExtension, profile.mimeType)
                    }

                    // Mark done
                    setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'done', progress: 100, result: res! } : p))
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err)
                    if (msg === 'Cancelled') {
                        setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'pending', progress: 0 } : p))
                        break
                    }
                    setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error', error: msg } : p))
                }
            }
        } finally {
            setIsConvertingBatch(false)
        }
    }, [batch, ffmpeg, magick])

    const handleReset = useCallback(() => {
        const finishedItems = batch.filter(i => i.status === 'done' || i.status === 'error')
        if (finishedItems.length > 0) {
            setHistory(h => [...finishedItems, ...h])
        }
        ffmpeg.cancel()
        magick.cancel()
        ffmpeg.reset()
        magick.reset()
        setBatch([])
        setIsConvertingBatch(false)
    }, [batch, ffmpeg, magick])

    const handleReuse = useCallback((item: BatchImageItem) => {
        setBatch(prev => [
            {
                id: crypto.randomUUID(),
                file: item.file,
                mode: item.mode,
                status: 'pending',
                progress: 0,
                result: null,
                error: null
            },
            ...prev
        ])
    }, [])

    const hasFiles = batch.length > 0
    const allDone = hasFiles && batch.every(i => i.status === 'done')
    const hasGlobalError = !!(ffmpeg.error || magick.error)

    const handleCancel = useCallback(() => {
        ffmpeg.cancel()
        magick.cancel()
    }, [ffmpeg, magick])
    return (
        <div className="w-full flex flex-col items-center">
            <SEOHead
                title="Free Image Converter Online — HEIC to JPG, WebP to PNG & More | convertfiles.app"
                description="Convert images free: HEIC to JPG, WebP to PNG, PNG to JPG, and 10+ formats. Instant, private, no upload. Full quality conversion in your browser."
                canonical={`${SITE_URL}/image-converter`}
                keywords={['image converter', 'heic to jpg', 'webp to png', 'png to jpg', 'jpg to png', 'webp to jpg', 'convert heic', 'free image converter', 'online image converter']}
            />

            {/* Full viewport container for perfect vertical centering */}
            <div className={`w-full flex flex-col items-center ${embedded ? 'pt-2 pb-4' : 'min-h-[calc(100vh-140px)] justify-center pt-8 pb-16'}`}>

                {/* Compact heading above the tool — hidden when embedded in a landing page */}
                {!embedded && (
                    <div className="w-full mb-8 flex flex-col items-center text-center">
                        <div className="inline-flex items-center justify-center mb-4">
                            <img src="/favicon.svg" alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-dark-900 tracking-tight mb-2">
                            convertfiles.app
                        </h1>
                        <p className="text-xl font-semibold text-brand-500 mb-2">
                            Image Converter
                        </p>
                        <p className="text-base text-dark-500 max-w-sm">
                            Convert any image to WebP, JPEG, PNG, HEIC, TIFF, and more.
                        </p>
                    </div>
                )}

                {/* The Converter Tool */}
                <div id="converter-tool" className="w-full max-w-xl mx-auto space-y-4">

                    {/* Error */}
                    {hasGlobalError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                            <span><strong>Error:</strong> {ffmpeg.error || magick.error}</span>
                            <div className="flex items-center gap-4 shrink-0 font-medium">
                                <button
                                    onClick={() => handleConvertBatch()}
                                    className="underline hover:text-red-900"
                                >
                                    Try again
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors font-semibold"
                                >
                                    Try a Different File
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Dropzone — hidden once there are files queued */}
                    {!hasFiles && (
                        <Dropzone
                            onFiles={handleFiles}
                            disabled={magick.status === 'loading'}
                            accepts="image/*"
                            title="Drop images here"
                            formats={['WebP', 'JPEG', 'PNG', 'GIF', 'HEIC', 'TIFF', 'PSD']}
                            icon={<svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>}
                        />
                    )}

                    {/* Batch List Data */}
                    {hasFiles && (
                        <BatchImageConversionList
                            batch={batch}
                            updateAllItems={updateAllItems}
                            removeItem={removeItem}
                            onConvertAll={handleConvertBatch}
                            isConvertingBatch={isConvertingBatch}
                        />
                    )}

                    {/* Progress / Global Log for transparency while converting */}
                    {isConvertingBatch && (
                        <ProgressDisplay
                            progress={batch.find(p => p.status === 'converting')?.progress || 0}
                            logMessages={ffmpeg.logMessages.length > 0 ? ffmpeg.logMessages : []}
                            onCancel={handleCancel}
                        />
                    )}

                    {/* Done Actions */}
                    {allDone && (
                        <div className="w-full flex justify-center gap-4 mt-4 pt-4 border-t border-dark-100">
                            <button
                                onClick={async () => {
                                    // 1. Ask user for file location IMMEDIATELY to preserve transient user activation
                                    let writable: any = null;
                                    let useFallback = true;

                                    if ('showSaveFilePicker' in window) {
                                        try {
                                            const handle = await (window as any).showSaveFilePicker({
                                                suggestedName: batch.length === 1 ? batch[0].result?.filename : 'converted_images.zip',
                                                types: [{
                                                    description: batch.length === 1 ? 'Image File' : 'ZIP Archive',
                                                    accept: batch.length === 1 && batch[0].result ? { [batch[0].result.blob.type]: [`.${batch[0].result.filename.split('.').pop()}`] } : { 'application/zip': ['.zip'] },
                                                }],
                                            });
                                            writable = await handle.createWritable();
                                            useFallback = false;
                                        } catch (err: any) {
                                            // User cancelled the prompt, abort completely
                                            if (err.name === 'AbortError') return;
                                            // Otherwise security error etc., let it gracefully fallback
                                        }
                                    }

                                    // 2. Begin zipping.
                                    setIsZipping(true);
                                    try {
                                        const zip = new JSZip();
                                        batch.forEach((item) => {
                                            if (item.result) {
                                                zip.file(item.result.filename, item.result.blob);
                                            }
                                        });
                                        const zipBlob = await zip.generateAsync({ type: 'blob' });

                                        // 3. Write data.
                                        if (!useFallback && writable) {
                                            if (batch.length === 1 && batch[0].result) {
                                                await writable.write(batch[0].result.blob);
                                            } else {
                                                await writable.write(zipBlob);
                                            }
                                            await writable.close();
                                        } else {
                                            // Fallback for browsers without showSaveFilePicker
                                            const url = URL.createObjectURL(batch.length === 1 && batch[0].result ? batch[0].result.blob : zipBlob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = batch.length === 1 && batch[0].result ? batch[0].result.filename : 'converted_images.zip';
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            setTimeout(() => URL.revokeObjectURL(url), 1000);
                                        }
                                    } catch (err) {
                                        console.error('Failed to zip/save files:', err);
                                        alert('Failed to create or save zip file.');
                                        if (writable) {
                                            // Ensure we don't leave lingering open files on error
                                            try { await writable.abort(); } catch (e) { }
                                        }
                                    } finally {
                                        setIsZipping(false);
                                    }
                                }}
                                disabled={isZipping}
                                className={`text-sm font-semibold px-6 py-2.5 rounded-lg transition-all shadow-md ${isZipping ? 'bg-dark-300 text-dark-600 cursor-not-allowed' : 'bg-brand-500 text-white hover:bg-brand-600'}`}
                            >
                                {isZipping ? 'Saving...' : batch.length === 1 ? 'Download Target File' : 'Download All as ZIP'}
                            </button>
                            <button
                                onClick={handleReset}
                                className="text-sm font-semibold text-dark-600 hover:text-dark-900 border border-dark-200 hover:border-dark-300 bg-dark-50 px-6 py-2.5 rounded-lg transition-all"
                            >
                                Convert Another File
                            </button>
                        </div>
                    )}

                    {/* Subtle trust line */}
                    {!hasFiles && (
                        <p className="text-center text-xs text-dark-400 mt-2">
                            🔒 Files never leave your device &nbsp;·&nbsp; No account needed &nbsp;·&nbsp; No limits
                        </p>
                    )}
                </div>

                {/* History Section */}
                <div className="w-full max-w-xl mx-auto relative z-20">
                    <ConversionHistoryList
                        history={history}
                        onReuse={handleReuse}
                        onRemove={(id) => setHistory(prev => prev.filter(i => i.id !== id))}
                        onClearAll={() => setHistory([])}
                        getProfile={(mode) => IMAGE_PROFILES[mode as ImageConversionMode]}
                    />
                </div>
            </div>

            {/* Related Tools — hidden when embedded */}
            {!embedded && <RelatedTools currentTool="image" />}

            {/* Marketing / Explainer Sections — hidden when embedded */}
            {!embedded && (
                <div className="w-full">
                    <Features />
                </div>
            )}
        </div>
    )
}
