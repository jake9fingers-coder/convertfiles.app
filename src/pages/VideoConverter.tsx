import { useState, useCallback, useEffect } from 'react'
import JSZip from 'jszip'
import { useFFmpeg, type ConversionResult } from '../hooks/useFFmpeg'
import type { ConversionMode, ConversionOptions } from '../lib/conversionProfiles'
import { PROFILES } from '../lib/conversionProfiles'
import Dropzone from '../components/Dropzone'
import ProgressDisplay from '../components/ProgressDisplay'
import BatchConversionList from '../components/BatchConversionList'

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

import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'

export default function VideoConverter() {
    const { status: ffmpegStatus, progress: globalProgress, logMessages, error: globalError, load, convert, cancel, reset } = useFFmpeg()

    const [batch, setBatch] = useState<BatchItem[]>([])
    const [isConvertingBatch, setIsConvertingBatch] = useState(false)
    const [isZipping, setIsZipping] = useState(false)

    // Sync ffmpeg progress back to currently converting item
    useEffect(() => {
        if (isConvertingBatch) {
            setBatch(prev => prev.map(p => p.status === 'converting' ? { ...p, progress: globalProgress } : p))
        }
    }, [globalProgress, isConvertingBatch])

    const handleFiles = useCallback((incomingFiles: File[]) => {
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
    }, [reset, load])

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
        cancel()
        reset()
        setBatch([])
        setIsConvertingBatch(false)
    }, [cancel, reset])

    const hasFiles = batch.length > 0
    const allDone = hasFiles && batch.every(i => i.status === 'done')

    return (
        <div className="w-full flex flex-col items-center">

            {/* Full viewport container for perfect vertical centering */}
            <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center pt-8 pb-16">

                {/* Compact heading above the tool */}
                <div className="w-full mb-8 flex flex-col items-center text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4">
                        <span className="text-3xl">⚡</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-2">
                        Convertly
                    </h1>
                    <p className="text-base text-gray-500 max-w-sm">
                        Convert, compress &amp; extract audio — free, instant, private
                    </p>
                </div>

                {/* The Converter Tool */}
                <div id="converter-tool" className="w-full max-w-xl mx-auto space-y-4 relative z-20">

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
                        <div className="w-full flex justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={async () => {
                                    // 1. Ask user for file location IMMEDIATELY to preserve transient user activation
                                    let writable: any = null;
                                    let useFallback = true;

                                    if ('showSaveFilePicker' in window) {
                                        try {
                                            const handle = await (window as any).showSaveFilePicker({
                                                suggestedName: 'convertly_files.zip',
                                                types: [{
                                                    description: 'ZIP Archive',
                                                    accept: { 'application/zip': ['.zip'] },
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
                                            await writable.write(zipBlob);
                                            await writable.close();
                                        } else {
                                            // Fallback for browsers without showSaveFilePicker
                                            const url = URL.createObjectURL(zipBlob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'convertly_files.zip';
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
                                className={`text-sm font-semibold text-white px-6 py-2.5 rounded-full transition-all shadow-md ${isZipping ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}
                            >
                                {isZipping ? 'Saving...' : 'Download All'}
                            </button>
                            <button
                                onClick={handleReset}
                                className="text-sm font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white px-6 py-2.5 rounded-full transition-all shadow-sm"
                            >
                                Clear & Start Over
                            </button>
                        </div>
                    )}

                    {/* Subtle trust line — only when idle */}
                    {!hasFiles && (
                        <p className="text-center text-xs text-gray-400 mt-2">
                            🔒 Files never leave your device &nbsp;·&nbsp; No account needed &nbsp;·&nbsp; No limits
                        </p>
                    )}
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
