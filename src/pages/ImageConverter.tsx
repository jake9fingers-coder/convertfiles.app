import { useState, useCallback, useEffect } from 'react'
import { Lock } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import { SITE_URL } from '../lib/seoConversionData'
import JSZip from 'jszip'
import { type ConversionResult } from '../hooks/useFFmpeg'
import { useMagick, type MagickConversionResult } from '../hooks/useMagick'
import type { ImageConversionMode } from '../lib/imageConversionProfiles'
import { IMAGE_PROFILES } from '../lib/imageConversionProfiles'
import Dropzone from '../components/Dropzone'
import ProgressDisplay from '../components/ProgressDisplay'
import BatchImageConversionList from '../components/BatchImageConversionList'
import ConversionHistoryList from '../components/ConversionHistoryList'
import { saveImageHistory, loadImageHistory } from '../lib/db'
import heic2any from 'heic2any'
import { convertImageWithCanvas, type CanvasConversionResult } from '../lib/canvasConvert'

export interface BatchImageItem {
    id: string
    file: File
    mode: ImageConversionMode
    status: 'pending' | 'converting' | 'done' | 'error'
    progress: number
    result: ConversionResult | MagickConversionResult | CanvasConversionResult | null
    error: string | null
    quality?: number
    compress?: boolean
}

import Features from '../components/Features'
import RelatedTools from '../components/RelatedTools'
import GenericSEOContent from '../components/GenericSEOContent'
import { TextRoll } from '../components/ui/text-roll'

export default function ImageConverter({ embedded = false }: { embedded?: boolean }) {
    // --- Magick engine for pro formats (TIFF, PSD, etc.) ---
    const magick = useMagick()

    const [batch, setBatch] = useState<BatchImageItem[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)
    const [isConvertingBatch, setIsConvertingBatch] = useState(false)
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

    // Sync progress from magick engine when active
    useEffect(() => {
        if (isConvertingBatch) {
            setBatch(prev => {
                const activeItem = prev.find(p => p.status === 'converting')
                if (!activeItem) return prev;

                const profile = IMAGE_PROFILES[activeItem.mode]
                if (profile.engine !== 'magick') return prev;

                return prev.map(p => p.status === 'converting' ? { ...p, progress: magick.progress } : p)
            })
        }
    }, [magick.progress, isConvertingBatch])

    const handleFiles = useCallback((incomingFiles: File[]) => {
        magick.reset()

        setBatch(prev => {
            const currentMode = prev.length > 0 ? (prev.find(b => b.status === 'pending' || b.status === 'error')?.mode || prev[0].mode) : 'webp' as ImageConversionMode;
            const currentCompress = prev.length > 0 ? (prev.find(b => b.status === 'pending' || b.status === 'error')?.compress || false) : false;

            const newBatch = incomingFiles.map(f => ({
                id: crypto.randomUUID(),
                file: f,
                mode: currentMode,
                status: 'pending' as const,
                progress: 0,
                result: null,
                error: null,
                quality: 80,
                compress: currentCompress
            })).filter(item => {
                const profile = IMAGE_PROFILES[item.mode]
                const inputExt = (item.file.name.split('.').pop() || '').toLowerCase()
                const outputExt = profile.outputExtension.toLowerCase()
                if (inputExt === outputExt && !item.compress) {
                    return false;
                }
                return true;
            })

            return [...prev, ...newBatch];
        })

        // Prewarm magick engine for pro formats
        magick.load()
    }, [magick.reset, magick.load])

    const updateAllItems = useCallback((updates: Partial<BatchImageItem>) => {
        setBatch(prev => {
            const updated = prev.map(p => ({ ...p, ...updates }))
            return updated.filter(item => {
                const profile = IMAGE_PROFILES[item.mode]
                const inputExt = (item.file.name.split('.').pop() || '').toLowerCase()
                const outputExt = profile.outputExtension.toLowerCase()
                if (inputExt === outputExt && !item.compress) {
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
            const profile = IMAGE_PROFILES[item.mode]
            const inputExt = (item.file.name.split('.').pop() || '').toLowerCase()
            const outputExt = profile.outputExtension.toLowerCase()

            if (inputExt === outputExt && !item.compress) {
                instantErrors.set(item.id, `Already a .${outputExt.toUpperCase()} file`)
            }
        })

        if (instantErrors.size > 0) {
            setBatch(prev => prev.map(p => instantErrors.has(p.id) ? {
                ...p,
                status: 'error',
                error: instantErrors.get(p.id)!
            } : p))
        }

        try {
            for (let i = 0; i < batch.length; i++) {
                const item = batch[i]
                if (item.status === 'done' || item.status === 'converting' || instantErrors.has(item.id)) continue

                const profile = IMAGE_PROFILES[item.mode]
                const inputExt = (item.file.name.split('.').pop() || '').toLowerCase()
                // Skipped files are handled by the pre-pass above

                setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'converting', error: null } : p))

                try {
                    let res: ConversionResult | MagickConversionResult | CanvasConversionResult;
                    let fileToConvert = item.file;

                    // HEIC/HEIF pre-processing: decode to a browser-readable format first
                    if ((inputExt === 'heic' || inputExt === 'heif') && profile.engine === 'canvas') {
                        const browserMime = (item.file.type || '').toLowerCase();
                        const isBrowserReadable = browserMime.startsWith('image/jpeg') || browserMime.startsWith('image/png') || browserMime.startsWith('image/webp');

                        if (isBrowserReadable) {
                            const readableExt = browserMime.includes('jpeg') ? 'jpg' : browserMime.includes('png') ? 'png' : 'webp';
                            const newName = item.file.name.replace(/\.heic$/i, `.${readableExt}`).replace(/\.heif$/i, `.${readableExt}`);

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
                                } as CanvasConversionResult;
                                const updatedItem = { ...item, status: 'done' as const, progress: 100, result: res! };
                                setBatch(prev => prev.map(p => p.id === item.id ? updatedItem : p));
                                continue;
                            }

                            fileToConvert = new File([item.file], newName, { type: browserMime });
                        } else {
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

                                if (profile.mimeType === toType && (profile.id as string) !== 'webp' && (profile.id as string) !== 'bmp') {
                                    const finalFile = new File([blob], newName, { type: toType });
                                    res = {
                                        file: finalFile,
                                        blob,
                                        url: URL.createObjectURL(blob),
                                        filename: newName,
                                        originalSize: item.file.size,
                                        outputSize: finalFile.size
                                    } as CanvasConversionResult;

                                    const updatedItem = { ...item, status: 'done' as const, progress: 100, result: res };
                                    setBatch(prev => prev.map(p => p.id === item.id ? updatedItem : p));
                                    continue;
                                }

                                fileToConvert = new File([blob], item.file.name.replace(/\.heic$/i, '.png').replace(/\.heif$/i, '.png'), { type: 'image/png' });
                            } catch (heicErr: any) {
                                const heicMsg = heicErr.message || String(heicErr);
                                if (heicMsg.includes('already browser readable')) {
                                    const newName = item.file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
                                    fileToConvert = new File([item.file], newName, { type: 'image/jpeg' });
                                } else {
                                    throw new Error(`Could not decode HEIC file: ${heicMsg}`);
                                }
                            }
                        }
                    }

                    // Route to the correct engine
                    if (profile.engine === 'canvas') {
                        // Instant browser-native conversion via Canvas API
                        // Pass quality (0.0 to 1.0) for canvas
                        const canvasQuality = item.compress && item.quality ? item.quality / 100 : undefined;
                        res = await convertImageWithCanvas(fileToConvert, profile.outputExtension, profile.mimeType, canvasQuality)
                    } else {
                        // Pro formats via ImageMagick WASM
                        const magickQuality = item.compress && item.quality ? item.quality : undefined;
                        res = await magick.convert(fileToConvert, profile.outputExtension, profile.mimeType, magickQuality)
                    }

                    // Mark done
                    const updatedItem = { ...item, status: 'done' as const, progress: 100, result: res! };
                    setBatch(prev => prev.map(p => p.id === item.id ? updatedItem : p))
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err)
                    if (msg === 'Cancelled') {
                        setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'pending' as const, progress: 0 } : p))
                        break
                    }
                    const errorItem = { ...item, status: 'error' as const, error: msg };
                    setBatch(prev => prev.map(p => p.id === item.id ? errorItem : p))
                }
            }
        } finally {
            // Push newly finished items to history using fresh batch state
            setBatch(currentBatch => {
                const justFinished = currentBatch.filter(i =>
                    (i.status === 'done' || i.status === 'error') &&
                    batch.some(b => b.id === i.id && b.status !== 'done' && b.status !== 'error')
                );
                if (justFinished.length > 0) {
                    // Reverse to maintain chronological order in the stack
                    setHistory(h => [...[...justFinished].reverse(), ...h]);
                }
                return currentBatch;
            });
            setIsConvertingBatch(false);
        }
    }, [batch, magick])

    const handleReset = useCallback(() => {
        magick.cancel()
        magick.reset()
        setBatch([])
        setIsConvertingBatch(false)
    }, [magick])

    const handleReuse = useCallback((item: BatchImageItem) => {
        setBatch(prev => [
            {
                id: crypto.randomUUID(),
                file: item.file,
                mode: item.mode,
                status: 'pending',
                progress: 0,
                result: null,
                error: null,
                quality: item.quality ?? 80,
                compress: item.compress ?? false
            },
            ...prev
        ])
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const hasFiles = batch.length > 0
    const hasGlobalError = !!magick.error

    const handleCancel = useCallback(() => {
        magick.cancel()
    }, [magick])
    return (
        <div className="w-full flex flex-col items-center">
            <SEOHead
                title="Free Image Converter Online - HEIC to JPG, WebP to PNG & More | convertfiles.app"
                description="Convert images free: HEIC to JPG, WebP to PNG, PNG to JPG, and 10+ formats. Instant, private, no upload. Full quality conversion in your browser."
                canonical={`${SITE_URL}/image-converter`}
                keywords={['image converter', 'heic to jpg', 'webp to png', 'png to jpg', 'jpg to png', 'webp to jpg', 'convert heic', 'free image converter', 'online image converter']}
            />

            {/* Full viewport container for perfect vertical centering */}
            <div className={`w-full flex flex-col items-center ${embedded ? 'pt-2 pb-4' : 'min-h-[calc(100vh-140px)] pt-16 pb-16'}`}>

                {/* Compact heading above the tool - hidden when embedded in a landing page */}
                {!embedded && (
                    <div className="w-full mb-8 flex flex-col items-center text-center">
                        <div className="inline-flex items-center justify-center mb-4">
                            <img src="/favicon.svg" alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-dark-900 tracking-tight mb-2">
                            <TextRoll>
                                convertfiles.app
                            </TextRoll>
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
                <div id="converter-tool" className="w-full max-w-xl mx-auto space-y-4 px-4 sm:px-0">

                    {/* Error */}
                    {hasGlobalError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                            <span><strong>Error:</strong> {magick.error}</span>
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
                        <Dropzone
                            onFiles={handleFiles}
                            disabled={false}
                            maxSizeMB={50}
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
                            onAddMore={handleFiles}
                            onClearBatch={handleReset}
                            onDownloadAll={async () => {
                                let writable: any = null;
                                let useFallback = true;
                                if ('showSaveFilePicker' in window) {
                                    try {
                                        let defaultName = 'batch_images_convertfiles-app.zip';
                                        if (batch.length === 1 && batch[0].result) {
                                            const nameParts = batch[0].result.filename.split('.');
                                            const ext = nameParts.pop() || '';
                                            const base = nameParts.join('.');
                                            defaultName = `${base}_convertfiles-app.${ext}`;
                                        }
                                        const handle = await (window as any).showSaveFilePicker({
                                            suggestedName: defaultName,
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
                                        let defaultName = 'batch_images_convertfiles-app.zip';
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
                            progress={batch.find(p => p.status === 'converting')?.progress || 0}
                            logMessages={[]}
                            onCancel={handleCancel}
                        />
                    )}

                    {/* Subtle trust line */}
                    {!hasFiles && (
                        <p className="flex items-center justify-center text-center text-xs text-dark-400 mt-2">
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
                        getProfile={(mode) => IMAGE_PROFILES[mode as ImageConversionMode]}
                        type="image"
                    />
                </div>
            </div>

            {/* Related Tools - hidden when embedded */}
            {!embedded && <RelatedTools currentTool="image" />}

            {/* Generic SEO Content for Homepage */}
            {!embedded && <GenericSEOContent toolId="image" />}

            {/* Marketing / Explainer Sections - hidden when embedded */}
            {!embedded && (
                <div className="w-full">
                    <Features />
                </div>
            )}
        </div>
    )
}
