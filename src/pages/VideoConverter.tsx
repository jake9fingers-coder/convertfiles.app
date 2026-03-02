import { useState, useCallback, useEffect } from 'react'
import JSZip from 'jszip'
import { useFFmpeg, type ConversionResult } from '../hooks/useFFmpeg'
import type { ConversionMode, ConversionOptions } from '../lib/conversionProfiles'
import { PROFILES } from '../lib/conversionProfiles'
import Dropzone from '../components/Dropzone'
import ProgressDisplay from '../components/ProgressDisplay'
import BatchConversionList from '../components/BatchConversionList'
import ConversionHistoryList from '../components/ConversionHistoryList'

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

export default function VideoConverter() {
    const { status: ffmpegStatus, progress: globalProgress, logMessages, error: globalError, load, convert, cancel, reset } = useFFmpeg()

    const [batch, setBatch] = useState<BatchItem[]>([])
    const [history, setHistory] = useState<BatchItem[]>([])
    const [isConvertingBatch, setIsConvertingBatch] = useState(false)
    const [isZipping, setIsZipping] = useState(false)

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
                // (We allow compressing an mp4 to an mp4, for example)
                if (inputExt === outputExt && item.mode !== 'compress') {
                    setBatch(prev => prev.map(p => p.id === item.id ? {
                        ...p,
                        status: 'error',
                        error: `Already a .${outputExt.toUpperCase()} file`
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

            {/* Full viewport container for perfect vertical centering */}
            <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center pt-8 pb-16">

                {/* Compact heading above the tool */}
                <div className="w-full mb-8 flex flex-col items-center text-center animate-fade-in">
                    <div className="inline-flex items-center justify-center p-3 bg-dark-900 rounded-xl mb-4 animate-slide-up">
                        <img src="/favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-dark-900 tracking-tight mb-2 animate-slide-up-delayed">
                        convertfiles.app
                    </h1>
                    <p className="text-xl font-semibold text-brand-500 mb-2 animate-slide-up-delayed" style={{ animationDelay: '0.15s' }}>
                        Video & Audio Converter
                    </p>
                    <p className="text-base text-dark-500 max-w-sm animate-slide-up-delayed" style={{ animationDelay: '0.25s' }}>
                        Convert, compress &amp; extract audio — free, instant, private
                    </p>
                </div>

                {/* The Converter Tool */}
                <div id="converter-tool" className="w-full max-w-xl mx-auto space-y-4 animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>

                    {/* Error */}
                    {globalError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
                            <span><strong>Error:</strong> {globalError}</span>
                            <button onClick={handleReset} className="ml-3 underline hover:text-red-900 shrink-0">
                                Try again
                            </button>
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
                                className={`text-sm font-semibold px-6 py-2.5 rounded-lg transition-all shadow-md ${isZipping ? 'bg-dark-300 text-dark-600 cursor-not-allowed' : 'bg-brand-500 text-dark-900 hover:bg-brand-600 hover:text-white'}`}
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

            {/* Marketing / Explainer Sections */}
            <div className="w-full">
                <Features />
            </div>
        </div>
    )
}
