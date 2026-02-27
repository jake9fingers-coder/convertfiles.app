import { useState, useCallback, useEffect } from 'react'
import JSZip from 'jszip'
import { useFFmpeg, type ConversionResult } from '../hooks/useFFmpeg'
import { useMagick, type MagickConversionResult } from '../hooks/useMagick'
import type { ImageConversionMode } from '../lib/imageConversionProfiles'
import { IMAGE_PROFILES } from '../lib/imageConversionProfiles'
import Dropzone from '../components/Dropzone'
import ProgressDisplay from '../components/ProgressDisplay'
import BatchImageConversionList from '../components/BatchImageConversionList'
import ConversionHistoryList from '../components/ConversionHistoryList'

export interface BatchImageItem {
    id: string
    file: File
    mode: ImageConversionMode
    status: 'pending' | 'converting' | 'done' | 'error'
    progress: number
    result: ConversionResult | MagickConversionResult | null
    error: string | null
}

import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'

export default function ImageConverter() {
    // --- Dual Engines ---
    const ffmpeg = useFFmpeg()
    const magick = useMagick()

    const [batch, setBatch] = useState<BatchImageItem[]>([])
    const [history, setHistory] = useState<BatchImageItem[]>([])
    const [isConvertingBatch, setIsConvertingBatch] = useState(false)
    const [isZipping, setIsZipping] = useState(false)

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

        // Prewarm both engines if possible, though Magick loads fast.
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

                    if (profile.engine === 'ffmpeg') {
                        res = await ffmpeg.convertImage(item.file, profile.id)
                    } else {
                        res = await magick.convert(item.file, profile.outputExtension, profile.mimeType)
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

            {/* Full viewport container for perfect vertical centering */}
            <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center pt-8 pb-16">

                {/* Compact heading above the tool */}
                <div className="w-full mb-8 flex flex-col items-center text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4">
                        <img src="/favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-2">
                        Image Converter
                    </h1>
                    <p className="text-base text-gray-500 max-w-sm">
                        Convert any image to WebP, JPEG, PNG, HEIC, TIFF, and more.
                    </p>
                </div>

                {/* The Converter Tool */}
                <div id="converter-tool" className="w-full max-w-xl mx-auto space-y-4 relative z-20">

                    {/* Error */}
                    {hasGlobalError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
                            <span><strong>Error:</strong> {ffmpeg.error || magick.error}</span>
                            <button onClick={handleReset} className="ml-3 underline hover:text-red-900 shrink-0">
                                Try again
                            </button>
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
                            icon={<svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>}
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
                        <div className="w-full flex justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={async () => {
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
                                            if (err.name === 'AbortError') return;
                                        }
                                    }

                                    setIsZipping(true);
                                    try {
                                        const zip = new JSZip();
                                        batch.forEach((item) => {
                                            if (item.result) {
                                                zip.file(item.result.filename, item.result.blob);
                                            }
                                        });
                                        const zipBlob = await zip.generateAsync({ type: 'blob' });

                                        if (!useFallback && writable) {
                                            if (batch.length === 1 && batch[0].result) {
                                                await writable.write(batch[0].result.blob);
                                            } else {
                                                await writable.write(zipBlob);
                                            }
                                            await writable.close();
                                        } else {
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
                                            try { await writable.abort(); } catch (e) { }
                                        }
                                    } finally {
                                        setIsZipping(false);
                                    }
                                }}
                                disabled={isZipping}
                                className={`text-sm font-semibold text-white px-6 py-2.5 rounded-full transition-all shadow-md ${isZipping ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}
                            >
                                {isZipping ? 'Saving...' : batch.length === 1 ? 'Download Target File' : 'Download All as ZIP'}
                            </button>
                            <button
                                onClick={handleReset}
                                className="text-sm font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white px-6 py-2.5 rounded-full transition-all shadow-sm"
                            >
                                Convert Another File
                            </button>
                        </div>
                    )}

                    {/* Subtle trust line */}
                    {!hasFiles && (
                        <p className="text-center text-xs text-gray-400 mt-2">
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

            {/* Marketing / Explainer Sections */}
            <div className="w-full bg-white">
                <HowItWorks />
                <Features />
            </div>
        </div>
    )
}
