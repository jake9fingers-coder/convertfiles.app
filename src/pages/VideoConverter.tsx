import { useState, useCallback, useEffect } from 'react'
import { Lock } from 'lucide-react'
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
import { TextRoll } from '../components/ui/text-roll'

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
import GenericSEOContent from '../components/GenericSEOContent';

export default function VideoConverter({ embedded = false }: { embedded?: boolean }) {
    const { status: ffmpegStatus, progress: globalProgress, logMessages, error: globalError, load, convert, cancel, reset } = useFFmpeg()

    const [batch, setBatch] = useState<BatchItem[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)
    const [isConvertingBatch, setIsConvertingBatch] = useState(false)

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
        reset()

        setBatch(prev => {
            const currentMode = prev.length > 0 ? (prev.find(b => b.status === 'pending' || b.status === 'error')?.mode || prev[0].mode) : 'gif' as ConversionMode;
            const currentOptions = prev.length > 0 ? (prev.find(b => b.status === 'pending' || b.status === 'error')?.options || prev[0].options) : { quality: 75, gifFps: 15, gifWidth: 480 };

            const newBatch = incomingFiles.map(f => ({
                id: crypto.randomUUID(),
                file: f,
                mode: currentMode,
                options: currentOptions,
                status: 'pending' as const,
                progress: 0,
                result: null,
                error: null
            })).filter(item => {
                const profile = PROFILES[item.mode]
                const inputExt = (item.file.name.split('.').pop() || '').toLowerCase()
                const outputExt = profile.outputExtension.toLowerCase()
                if (inputExt === outputExt && item.mode !== 'compress') {
                    return false;
                }
                return true;
            })

            return [...prev, ...newBatch];
        })
        load() // prewarm
    }, [reset, load])

    const updateAllItems = useCallback((updates: Partial<BatchItem>) => {
        setBatch(prev => {
            const updated = prev.map(p => ({ ...p, ...updates }))
            return updated.filter(item => {
                const profile = PROFILES[item.mode]
                const inputExt = (item.file.name.split('.').pop() || '').toLowerCase()
                const outputExt = profile.outputExtension.toLowerCase()
                if (inputExt === outputExt && item.mode !== 'compress') {
                    return false;
                }
                return true;
            })
        })
    }, [])

    const removeItem = useCallback((id: string) => {
        setBatch(prev => prev.filter(p => p.id !== id))
    }, [])

    const handleConvertBatch = useCallback(async () => {
        setIsConvertingBatch(true)

        // Pre-validate pending files to prevent O(N^2) state updates & UI freeze
        const instantErrors = new Map<string, string>()
        batch.forEach(item => {
            if (item.status === 'done' || item.status === 'converting') return
            const profile = PROFILES[item.mode]
            const inputExt = (item.file.name.split('.').pop() || '').toLowerCase()
            const outputExt = profile.outputExtension.toLowerCase()

            // Only block if they are doing a straight conversion to the exact same format
            if (inputExt === outputExt && item.mode !== 'compress') {
                instantErrors.set(item.id, `Already a .${outputExt.toUpperCase()} file`)
            } else if (item.file.type.startsWith('audio/') && item.mode !== 'mp3') {
                // Prevent audio-only inputs from going into video outputs
                instantErrors.set(item.id, `Cannot convert an audio file to a video format.`)
            }
        })

        if (instantErrors.size > 0) {
            setBatch(prev => prev.map(p => instantErrors.has(p.id) ? {
                ...p,
                status: 'error',
                error: instantErrors.get(p.id)!
            } : p))
        }

        const newlyFinished: BatchItem[] = [];
        if (instantErrors.size > 0) {
            batch.forEach(item => {
                if (instantErrors.has(item.id)) {
                    newlyFinished.push({
                        ...item,
                        status: 'error',
                        error: instantErrors.get(item.id)!
                    });
                }
            });
        }

        // Loop through all pending or errored sequentially
        // Cannot use forEach with async smoothly inside React state closures if we want to read fresh state,
        // so we just rely on the batch array from closures but step through sequentially.
        try {
            for (let i = 0; i < batch.length; i++) {
                const item = batch[i]
                if (item.status === 'done' || item.status === 'converting' || instantErrors.has(item.id)) continue

                // Skipped files are handled by the pre-pass above

                // Mark current as converting
                setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'converting', error: null } : p))

                try {
                    const res = await convert(item.file, item.mode, item.options)
                    // Mark done
                    const updatedItem = { ...item, status: 'done' as const, progress: 100, result: res! };
                    setBatch(prev => prev.map(p => p.id === item.id ? updatedItem : p))
                    newlyFinished.push(updatedItem);
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err)
                    // Stop entirely if user clicked cancel (it throws 'Cancelled')
                    if (msg === 'Cancelled') {
                        setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'pending' as const, progress: 0 } : p))
                        break
                    }
                    const errorItem = { ...item, status: 'error' as const, error: msg };
                    setBatch(prev => prev.map(p => p.id === item.id ? errorItem : p))
                    newlyFinished.push(errorItem);
                }
            }
        } finally {
            if (newlyFinished.length > 0) {
                if (batch.length > 1 || newlyFinished.length > 1) {
                    setHistory(h => [[...newlyFinished].reverse(), ...h]);
                } else {
                    setHistory(h => [...[...newlyFinished].reverse(), ...h]);
                }
            }
            setIsConvertingBatch(false);
        }
    }, [batch, convert])

    const handleReset = useCallback(() => {
        cancel()
        reset()
        setBatch([])
        setIsConvertingBatch(false)
    }, [cancel, reset])

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
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const hasFiles = batch.length > 0

    return (
        <div className="w-full flex flex-col items-center">
            <SEOHead
                title="Free Video & Audio Converter Online - MP4 to GIF, MP3 & More | convertfiles.app"
                description="Convert video to GIF, MP4, WebM or extract audio to MP3. Free, instant, private - runs in your browser. No upload, no limits, no sign-up."
                canonical={`${SITE_URL}/`}
                keywords={['video converter', 'mp4 to gif', 'mp4 to mp3', 'video to gif', 'video to mp3', 'mov to mp4', 'compress video', 'free video converter', 'online video converter']}
            />

            {/* Full viewport container for perfect vertical centering */}
            <div className={`w-full flex flex-col items-center ${embedded ? 'pt-2 pb-4' : 'min-h-[calc(100vh-140px)] pt-16 pb-16'}`}>

                {/* Compact heading above the tool - hidden when embedded */}
                {!embedded && (
                    <div className="w-full mb-8 flex flex-col items-center text-center">
                        <div className="inline-flex items-center justify-center mb-4">
                            <img src="/favicon.svg" alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                        <h1
                            className="text-4xl md:text-5xl font-bold text-dark-900 tracking-tight mb-2"
                        >
                            <TextRoll>
                                convertfiles.app
                            </TextRoll>
                        </h1>
                        <p className="text-xl font-semibold text-brand-500 mb-2">
                            Video & Audio Converter
                        </p>
                        <p className="text-base text-dark-500 max-w-sm">
                            Convert, compress &amp; extract audio - free, instant, private
                        </p>
                    </div>
                )}

                {/* The Converter Tool */}
                <div id="converter-tool" className="w-full max-w-xl mx-auto space-y-4 px-4 sm:px-0">

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

                    {/* Dropzone - hidden once there are files queued */}
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
                            onAddMore={handleFiles}
                            onClearBatch={() => setBatch([])}
                            onDownloadAll={async () => {
                                let writable: any = null;
                                let useFallback = true;
                                if ('showSaveFilePicker' in window) {
                                    try {
                                        let defaultName = 'batch_videos_convertfiles-app.zip';
                                        if (batch.length === 1 && batch[0].result) {
                                            const nameParts = batch[0].result.filename.split('.');
                                            const ext = nameParts.pop() || '';
                                            const base = nameParts.join('.');
                                            defaultName = `${base}_convertfiles-app.${ext}`;
                                        }
                                        const handle = await (window as any).showSaveFilePicker({
                                            suggestedName: defaultName,
                                            types: [{
                                                description: batch.length === 1 ? 'Media File' : 'ZIP Archive',
                                                accept: batch.length === 1 && batch[0].result ? { [batch[0].result.blob.type]: [`.${batch[0].result.filename.split('.').pop()}`] } : { 'application/zip': ['.zip'] },
                                            }],
                                        });
                                        writable = await handle.createWritable();
                                        useFallback = false;
                                    } catch (err: any) {
                                        if (err.name === 'AbortError') return;
                                    }
                                }
                                try {
                                    const zip = new JSZip();
                                    const usedNames = new Set<string>();
                                    batch.forEach((item) => {
                                        if (item.result) {
                                            let finalName = item.result.filename;
                                            let counter = 1;
                                            while (usedNames.has(finalName)) {
                                                const nameParts = item.result.filename.split('.');
                                                const ext = nameParts.pop();
                                                const base = nameParts.join('.');
                                                finalName = `${base} (${counter}).${ext}`;
                                                counter++;
                                            }
                                            usedNames.add(finalName);
                                            zip.file(finalName, item.result.blob);
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
                                        let defaultName = 'batch_videos_convertfiles-app.zip';
                                        if (batch.length === 1 && batch[0].result) {
                                            const nameParts = batch[0].result.filename.split('.');
                                            const ext = nameParts.pop() || '';
                                            const base = nameParts.join('.');
                                            defaultName = `${base}_convertfiles-app.${ext}`;
                                        }
                                        a.download = defaultName;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                    }
                                } catch (e) {
                                    console.error("Zipping failed:", e);
                                    alert("Oops, failed to build ZIP file.");
                                }
                            }}
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



                    {/* Subtle trust line - only when idle */}
                    {!hasFiles && (
                        <p className="flex justify-center items-center text-center text-xs text-dark-400 mt-2">
                            <Lock className="w-3 h-3 mr-1.5" /> Files never leave your device &nbsp;·&nbsp; No account needed &nbsp;·&nbsp; No limits
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
                        type="video"
                    />
                </div>
            </div>

            {/* Related Tools - hidden when embedded */}
            {!embedded && <RelatedTools currentTool="video" />}

            {/* Generic SEO Content for Homepage */}
            {!embedded && <GenericSEOContent toolId="video" />}

            {/* Marketing / Explainer Sections - hidden when embedded */}
            {!embedded && (
                <div className="w-full">
                    <Features />
                </div>
            )}
        </div>
    )
}
