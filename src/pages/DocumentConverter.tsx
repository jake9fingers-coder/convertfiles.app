import { useState, useCallback, useEffect } from 'react'
import SEOHead from '../components/SEOHead'
import { SITE_URL } from '../lib/seoConversionData'
import type { DocumentConversionMode } from '../lib/documentConversionProfiles'
import { convertDocumentFile, type DocumentConversionResult } from '../hooks/useDocumentConversion'
import Dropzone from '../components/Dropzone'
import Features from '../components/Features'
import { FileText, Download, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react'
import ConversionHistoryList from '../components/ConversionHistoryList'
import { saveDocumentHistory, loadDocumentHistory, type DocumentHistoryItem } from '../lib/db'
import { DOCUMENT_PROFILES } from '../lib/documentConversionProfiles'
import GenericSEOContent from '../components/GenericSEOContent'
import { TextRoll } from '@/components/ui/text-roll'

// For this specific UI, since Image -> PDF takes MULTIPLE files to build ONE output
// And PDF -> Image takes ONE file to build ONE output ZIP, 
// a traditional 'batch list' is clunky. We'll build a specialized view here.

type AppState = 'idle' | 'files_selected' | 'converting' | 'done' | 'error'

export default function DocumentConverter({ embedded = false }: { embedded?: boolean }) {
    const [files, setFiles] = useState<File[]>([])
    const [mode, setMode] = useState<DocumentConversionMode>('pdf_to_images')
    const [state, setState] = useState<AppState>('idle')
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState<DocumentConversionResult | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const [history, setHistory] = useState<DocumentHistoryItem[]>([])
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)

    useEffect(() => {
        loadDocumentHistory().then(data => {
            setHistory(data)
            setIsHistoryLoaded(true)
        })
    }, [])

    useEffect(() => {
        if (isHistoryLoaded) {
            saveDocumentHistory(history)
        }
    }, [history, isHistoryLoaded])

    const handleFiles = useCallback((incomingFiles: File[]) => {
        // Auto-detect mode based on first file
        const firstType = incomingFiles[0].type
        let newMode: DocumentConversionMode = 'images_to_pdf'

        if (firstType === 'application/pdf') {
            newMode = 'pdf_to_images'
            // PDF to images only supports 1 PDF at a time in this simple UI
            setFiles([incomingFiles[0]])
        } else {
            setFiles(incomingFiles)
        }

        setMode(newMode)
        setState('files_selected')
        setResult(null)
        setErrorMsg(null)
        setProgress(0)
    }, [])

    const handleConvert = async () => {
        if (files.length === 0) return

        setState('converting')
        setProgress(0)
        setErrorMsg(null)

        try {
            // Slight delay so the UI updates to 'converting' instantly for better INP
            await new Promise(r => setTimeout(r, 50))

            const res = await convertDocumentFile(files, mode, (pct) => setProgress(pct))

            setResult(res)
            setProgress(100)
            setState('done')

            const doneItem: DocumentHistoryItem = {
                id: crypto.randomUUID(),
                file: files[0],
                files: files,
                mode: mode,
                status: 'done',
                result: res,
                error: null,
                timestamp: Date.now()
            }
            setHistory(h => [doneItem, ...h])
        } catch (err: any) {
            console.error("Document conversion failed", err)
            setErrorMsg(err.message || String(err))
            setState('error')

            const errItem: DocumentHistoryItem = {
                id: crypto.randomUUID(),
                file: files[0],
                files: files,
                mode: mode,
                status: 'error',
                result: null,
                error: err.message || String(err),
                timestamp: Date.now()
            }
            setHistory(h => [errItem, ...h])
        }
    }

    const reset = () => {
        setFiles([])
        setState('idle')
        setResult(null)
        setErrorMsg(null)
        setProgress(0)
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    return (
        <div className="w-full flex flex-col items-center">
            <SEOHead
                title="Free Document Converter — PDF to JPG & Images to PDF | convertfiles.app"
                description="Convert PDF files to high-quality images or merge multiple images into a single PDF document instantly. Free, private, offline document conversions."
                canonical={`${SITE_URL}/document-converter`}
                keywords={['pdf to jpg', 'pdf to image', 'images to pdf', 'jpg to pdf', 'merge to pdf', 'document converter']}
            />
            <div className={`w-full flex flex-col items-center ${embedded ? 'pt-2 pb-4 px-4' : 'min-h-[calc(100vh-140px)] pt-16 pb-16 px-4'}`}>

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
                            Document Converter
                        </p>
                        <p className="text-base text-dark-500 max-w-sm">
                            Convert PDFs to Images, or Images to PDF securely offline.
                        </p>
                    </div>
                )}

                <div className="w-full max-w-2xl mx-auto space-y-4 relative z-20">

                    {state === 'idle' && (
                        <Dropzone
                            onFiles={handleFiles}
                            accepts=".pdf,image/jpeg,image/png"
                            title="Drop a PDF or Images here"
                            formats={['PDF', 'JPG', 'PNG']}
                            icon={<FileText className="w-8 h-8 text-brand-500" />}
                        />
                    )}

                    {state !== 'idle' && (
                        <div className="bg-white border border-dark-200 rounded-2xl shadow-sm p-6 animate-slide-up">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8 border-b border-dark-100 pb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-dark-900 flex items-center gap-2">
                                        {mode === 'pdf_to_images' ? 'PDF to Images' : 'Images to PDF'}
                                    </h2>
                                    <p className="text-sm text-dark-500">
                                        {mode === 'pdf_to_images'
                                            ? `Extracting pages from ${files[0]?.name}`
                                            : `Merging ${files.length} images into a single PDF`}
                                    </p>
                                </div>
                                <button
                                    onClick={reset}
                                    className="text-sm font-semibold text-dark-400 hover:text-dark-700 transition-colors"
                                >
                                    Start Over
                                </button>
                            </div>

                            {/* Status Area */}
                            <div className="flex flex-col items-center justify-center py-8">

                                {state === 'files_selected' && (
                                    <>
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                            <FileText className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <button
                                            onClick={handleConvert}
                                            className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm shadow-brand-500/20 transition-all hover:shadow-brand-500/30 transform hover:-translate-y-0.5"
                                        >
                                            Convert Now
                                        </button>
                                        <p className="text-xs font-medium text-dark-400 mt-4">Takes place entirely in your browser.</p>
                                    </>
                                )}

                                {state === 'converting' && (
                                    <>
                                        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-6">
                                            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                                        </div>
                                        <h3 className="text-lg font-bold text-dark-900 mb-2">Processing...</h3>
                                        <div className="w-64 h-2 bg-dark-100 rounded-full overflow-hidden mt-2 relative">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-brand-500 transition-all duration-300 ease-out"
                                                style={{ width: `${Math.max(5, progress)}%` }} // Ensure at least a sliver shows
                                            />
                                        </div>
                                        <p className="text-sm font-semibold text-brand-600 mt-3">{Math.round(progress)}%</p>
                                    </>
                                )}

                                {state === 'error' && (
                                    <>
                                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                            <AlertCircle className="w-8 h-8 text-red-500" />
                                        </div>
                                        <h3 className="text-lg font-bold text-red-700 mb-2">Conversion Failed</h3>
                                        <p className="text-sm text-red-600/80 mb-6 text-center max-w-sm">{errorMsg}</p>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handleConvert}
                                                className="px-6 py-2 bg-dark-100 hover:bg-dark-200 text-dark-700 font-bold rounded-xl transition-colors text-sm"
                                            >
                                                Try Again
                                            </button>
                                            <button
                                                onClick={reset}
                                                className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl transition-colors text-sm"
                                            >
                                                Try a Different File
                                            </button>
                                        </div>
                                    </>
                                )}

                                {state === 'done' && result && (
                                    <>
                                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-50/50">
                                            <CheckCircle className="w-8 h-8 text-green-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-dark-900 mb-2">Conversion Complete!</h3>
                                        <p className="text-sm font-medium text-dark-500 mb-8">
                                            {result.filename} ({formatBytes(result.blob.size)})
                                        </p>

                                        <a
                                            href={result.url}
                                            download={result.filename}
                                            className="flex items-center gap-2 px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm shadow-brand-500/20 transition-all hover:shadow-brand-500/30 transform hover:-translate-y-0.5"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download File
                                        </a>
                                    </>
                                )}

                            </div>
                        </div>
                    )}

                </div>

                {/* History Section */}
                <div className="w-full max-w-2xl mx-auto relative z-20 mt-8">
                    <ConversionHistoryList
                        history={history}
                        onReuse={(item: DocumentHistoryItem) => {
                            setFiles(item.files)
                            setMode(item.mode as DocumentConversionMode)
                            setState('files_selected')
                            setResult(null)
                            setErrorMsg(null)
                            setProgress(0)
                        }}
                        onRemove={(id) => setHistory(prev => prev.filter(i => i.id !== id))}
                        onClearAll={() => setHistory([])}
                        getProfile={(m) => DOCUMENT_PROFILES[m as DocumentConversionMode]}
                    />
                </div>

                {state === 'idle' && !embedded && (
                    <p className="flex items-center justify-center text-center text-xs text-dark-400 mt-6 max-w-lg mb-12">
                        <Lock className="w-3 h-3 mr-1.5 shrink-0" /> Confidential documents? Conversions happen entirely in your browser memory. No data is ever sent to a server.
                    </p>
                )}
            </div>

            {!embedded && <GenericSEOContent toolId="document" />}

            {!embedded && (
                <div className="w-full relative z-10">
                    <Features />
                </div>
            )}
        </div>
    )
}
