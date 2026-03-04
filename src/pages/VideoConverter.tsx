import { useState, useCallback, useEffect } from 'react'
import SEOHead from '../components/SEOHead'
import { SITE_URL } from '../lib/seoConversionData'
import JSZip from 'jszip'
import { useFFmpeg, type ConversionResult } from '../hooks/useFFmpeg'
import type { ConversionMode, ConversionOptions } from '../lib/conversionProfiles'
import { PROFILES } from '../lib/conversionProfiles'
import Dropzone from '../components/Dropzone'
import ProgressDisplay from '../components/ProgressDisplay'
import BatchConversionList from '../components/BatchConversionList'
import ConversionHistoryList from '../components/ConversionHistoryList'
import { saveVideoHistory, loadVideoHistory } from '../lib/db'

export interface BatchItem {
    id: string
    file: File
    mode: ConversionMode
    options: ConversionOptions
    status: 'pending' | 'converting' | 'done' | 'error'
    progress: number
    result: ConversionResult | null
    error: string | null
}

import Features from '../components/Features'
import RelatedTools from '../components/RelatedTools'

export default function VideoConverter({ embedded = false }: { embedded?: boolean }) {
    const { status: ffmpegStatus, progress: globalProgress, logMessages, error: globalError, load, convert, cancel, reset } = useFFmpeg()

    const [batch, setBatch] = useState<BatchItem[]>([])
    const [history, setHistory] = useState<BatchItem[]>([])
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)
    const [isConvertingBatch, setIsConvertingBatch] = useState(false)
    const [isZipping, setIsZipping] = useState(false)

    // Load history on mount
    useEffect(() => {
        loadVideoHistory().then(data => {
            setHistory(data)
            setIsHistoryLoaded(true)
        })
    }, [])

    // Sync history to IndexedDB when it changes
    useEffect(() => {
        if (isHistoryLoaded) {
            saveVideoHistory(history)
        }
    }, [history, isHistoryLoaded])

    // Sync ffmpeg progress back to currently converting item
    useEffect(() => {
        if (isConvertingBatch) {
            setBatch(prev => prev.map(p => p.status === 'converting' ? { ...p, progress: globalProgress } : p))
        }
    }, [globalProgress, isConvertingBatch])

    const handleFiles = useCallback((incomingFiles: File[]) => {
        const finishedItems = batch.filter(i => i.status === 'done' || i.status === 'error')
        if (finishedItems.length > 0) {
            setHistory(h => [...finishedItems, ...h])
        }

        reset()

        const newBatch = incomingFiles.map(f => ({
            id: crypto.randomUUID(),
            file: f,
            mode: 'gif' as ConversionMode,
            options: { quality: 75, gifFps: 15, gifWidth: 480 },
            status: 'pending' as const,
            progress: 0,
            result: null,
            error: null
        }))

        setBatch(newBatch)
        load() // prewarm
    }, [batch, reset, load])

    const updateAllItems = useCallback((updates: Partial<BatchItem>) => {
        setBatch(prev => prev.map(p => ({ ...p, ...updates })))
    }, [])

    const removeItem = useCallback((id: string) => {
        setBatch(prev => prev.filter(p => p.id !== id))
    }, [])

    const handleConvertBatch = useCallback(async () => {
        setIsConvertingBatch(true)

        // Loop through all pending or errored sequentially
        // Cannot use forEach with async smoothly inside React state closures if we want to read fresh state,
        // so we just rely on the batch array from closures but step through sequentially.
        try {
            for (let i = 0; i < batch.length; i++) {
                const item = batch[i]
                if (item.status === 'done' || item.status === 'converting') continue

                const profile = PROFILES[item.mode]
                const inputExt = (item.file.name.split('.').pop() || '').toLowerCase()
                const outputExt = profile.outputExtension.toLowerCase()

                // Only block if they are doing a straight conversion to the exact same format
                if (inputExt === outputExt && item.mode !== 'compress') {
                    setBatch(prev => prev.map(p => p.id === item.id ? {
                        ...p,
                        status: 'error',
                        error: `Already a .${outputExt.toUpperCase()} file`
                    } : p))
                    continue
                }

                // Prevent audio-only inputs from going into video outputs
                if (item.file.type.startsWith('audio/') && item.mode !== 'mp3') {
                    setBatch(prev => prev.map(p => p.id === item.id ? {
                        ...p,
                        status: 'error',
                        error: `Cannot convert an audio file to a video format.`
                    } : p))
                    continue
                }

                // Mark current as converting
                setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'converting', error: null } : p))

                try {
                    const res = await convert(item.file, item.mode, item.options)
                    // Mark done
                    setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'done', progress: 100, result: res } : p))
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err)
                    // Stop entirely if user clicked cancel (it throws 'Cancelled')
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
    }, [batch, convert])

    const handleReset = useCallback(() => {
        const finishedItems = batch.filter(i => i.status === 'done' || i.status === 'error')
        if (finishedItems.length > 0) {
            setHistory(h => [...finishedItems, ...h])
        }
        cancel()
        reset()
        setBatch([])
        setIsConvertingBatch(false)
    }, [batch, cancel, reset])

    const handleReuse = useCallback((item: BatchItem) => {
        setBatch(prev => [
            {
                id: crypto.randomUUID(),
                file: item.file,
                mode: item.mode,
                options: item.options,
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

    return (
        <div className="w-full flex flex-col items-center">
            <SEOHead
                title="Free Video & Audio Converter Online — MP4 to GIF, MP3 & More | convertfiles.app"
                description="Convert video to GIF, MP4, WebM or extract audio to MP3. Free, instant, private — runs in your browser. No upload, no limits, no sign-up."
                canonical={`${SITE_URL}/`}
                keywords={['video converter', 'mp4 to gif', 'mp4 to mp3', 'video to gif', 'video to mp3', 'mov to mp4', 'compress video', 'free video converter', 'online video converter']}
            />

            {/* Full viewport container for perfect vertical centering */}
            <div className={`w-full flex flex-col items-center ${embedded ? 'pt-2 pb-4' : 'min-h-[calc(100vh-140px)] justify-center pt-8 pb-16'}`}>

                {/* Compact heading above the tool — hidden when embedded */}
                {!embedded && (
                    <div className="w-full mb-8 flex flex-col items-center text-center">
                        <div className="inline-flex items-center justify-center mb-4">
                            <img src="/favicon.svg" alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-dark-900 tracking-tight mb-2">
                            convertfiles.app
                        </h1>
                        <p className="text-xl font-semibold text-brand-500 mb-2">
                            Video & Audio Converter
                        </p>
                        <p className="text-base text-dark-500 max-w-sm">
                            Convert, compress &amp; extract audio — free, instant, private
                        </p>
                    </div>
                )}

                {/* The Converter Tool */}
                <div id="converter-tool" className="w-full max-w-xl mx-auto space-y-4">

                    {/* Error */}
                    {globalError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                            <span><strong>Error:</strong> {globalError}</span>
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
                        <Dropzone onFiles={handleFiles} disabled={ffmpegStatus === 'loading'} />
                    )}

                    {/* Batch List Data */}
                    {hasFiles && (
                        <BatchConversionList
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
                            progress={globalProgress}
                            logMessages={logMessages}
                            onCancel={cancel}
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
                                                suggestedName: batch.length === 1 ? batch[0].result?.filename : 'convertfiles.zip',
                                                types: [{
                                                    description: batch.length === 1 ? 'Media File' : 'ZIP Archive',
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
                                            a.download = batch.length === 1 && batch[0].result ? batch[0].result.filename : 'convertfiles.zip';
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

                    {/* Subtle trust line — only when idle */}
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
                        getProfile={(mode) => PROFILES[mode as ConversionMode]}
                    />
                </div>
            </div>

            {/* Related Tools — hidden when embedded */}
            {!embedded && <RelatedTools currentTool="video" />}

            {/* Marketing / Explainer Sections — hidden when embedded */}
            {!embedded && (
                <div className="w-full">
                    <Features />
                </div>
            )}
        </div>
    )
}
