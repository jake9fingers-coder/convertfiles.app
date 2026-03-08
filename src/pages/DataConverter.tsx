import { useState, useCallback, useEffect } from 'react'
import { Lock } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import { SITE_URL } from '../lib/seoConversionData'
import { DATA_PROFILES, type DataConversionMode } from '../lib/dataConversionProfiles'
import { convertDataFile, type DataConversionResult } from '../hooks/useDataConversion'
import Dropzone from '../components/Dropzone'
import BatchDataConversionList from '../components/BatchDataConversionList'
import Features from '../components/Features'
import RelatedTools from '../components/RelatedTools'
import GenericSEOContent from '../components/GenericSEOContent'
import ConversionHistoryList from '../components/ConversionHistoryList'
import { saveDataHistory, loadDataHistory } from '../lib/db'
import { TextRoll } from '../components/ui/text-roll'

export interface BatchDataItem {
    id: string
    file: File
    mode: DataConversionMode
    status: 'pending' | 'converting' | 'done' | 'error'
    progress: number
    result: DataConversionResult | null
    error: string | null
}

export default function DataConverter({ embedded = false }: { embedded?: boolean }) {
    const [batch, setBatch] = useState<BatchDataItem[]>([])
    const [isConvertingBatch, setIsConvertingBatch] = useState(false)
    const [history, setHistory] = useState<any[]>([])
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)

    // Load history on mount
    useEffect(() => {
        loadDataHistory().then(data => {
            setHistory(data)
            setIsHistoryLoaded(true)
        })
    }, [])

    // Sync history to IndexedDB when it changes
    useEffect(() => {
        if (isHistoryLoaded) {
            saveDataHistory(history)
        }
    }, [history, isHistoryLoaded])

    const handleFiles = useCallback((incomingFiles: File[]) => {
        const newBatch = incomingFiles.map(f => {
            const ext = f.name.toLowerCase().match(/\.[^.]+$/)?.[0] || ''
            const type = f.type || ''

            let initialMode: DataConversionMode = 'json_to_csv'
            if (ext === '.csv' || type === 'text/csv') {
                initialMode = 'csv_to_json'
            } else if (ext === '.xlsx' || ext === '.xls' || type.includes('spreadsheetml') || type.includes('ms-excel')) {
                initialMode = 'xlsx_to_csv'
            }

            return {
                id: crypto.randomUUID(),
                file: f,
                mode: initialMode,
                status: 'pending' as const,
                progress: 0,
                result: null,
                error: null
            }
        })
        setBatch(prev => [...prev, ...newBatch])
    }, [])

    const updateAllItems = useCallback((updates: Partial<BatchDataItem>) => {
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

                setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'converting', error: null, progress: 50 } : p))

                try {
                    const res = await convertDataFile(item.file, item.mode)
                    const doneItem = { ...item, status: 'done', progress: 100, result: res } as BatchDataItem
                    setBatch(prev => prev.map(p => p.id === item.id ? doneItem : p))
                } catch (err: any) {
                    setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error', error: err.message || String(err), progress: 0 } : p))
                }
            }
        } finally {
            setBatch(currentBatch => {
                const justFinished = currentBatch.filter(i =>
                    (i.status === 'done' || i.status === 'error') &&
                    batch.some(b => b.id === i.id && b.status !== 'done' && b.status !== 'error')
                );
                if (justFinished.length > 0) {
                    if (currentBatch.length > 1 || justFinished.length > 1) {
                        setHistory(h => [[...justFinished].reverse(), ...h]);
                    } else {
                        setHistory(h => [...[...justFinished].reverse(), ...h]);
                    }
                }
                return currentBatch;
            });
            setIsConvertingBatch(false)
        }
    }, [batch])

    const hasFiles = batch.length > 0

    return (
        <div className="w-full flex flex-col items-center">
            <SEOHead
                title="Free Data Converter - JSON to CSV, Excel to JSON & More | convertfiles.app"
                description="Convert JSON to CSV, CSV to Excel, Excel to JSON and more. Free, private, instant data conversion in your browser. No upload needed."
                canonical={`${SITE_URL}/data-converter`}
                keywords={['json to csv', 'csv to json', 'json to excel', 'csv to excel', 'excel to csv', 'data converter', 'free data converter']}
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
                            Data Converter
                        </p>
                        <p className="text-base text-dark-500 max-w-sm">
                            Convert JSON to CSV, Excel to JSON, and more securely offline.
                        </p>
                    </div>
                )}

                {/* The Converter Tool */}
                <div id="converter-tool" className="w-full max-w-xl mx-auto space-y-4 relative z-20 px-4 sm:px-0">
                    {!hasFiles && (
                        <Dropzone
                            onFiles={handleFiles}
                            accepts=".json,.csv,.xlsx,.xls,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            title="Drop data files here"
                            formats={['JSON', 'CSV', 'XLSX']}
                            icon={<svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                        />
                    )}

                    {hasFiles && (
                        <BatchDataConversionList
                            batch={batch}
                            updateAllItems={updateAllItems}
                            removeItem={removeItem}
                            onConvertAll={handleConvertBatch}
                            isConvertingBatch={isConvertingBatch}
                            onAddMore={handleFiles}
                            onClearBatch={() => setBatch([])}
                        />
                    )}
                </div>

            </div>

            {/* History Section */}
            <div className="w-full max-w-xl mx-auto relative z-20">
                <ConversionHistoryList
                    history={history}
                    onReuse={(item) => setBatch(prev => [...prev, { ...item, id: crypto.randomUUID(), status: 'pending', progress: 0, result: null, error: null }])}
                    onRemove={(id) => setHistory(prev => prev.filter(i => i.id !== id))}
                    onClearAll={() => setHistory([])}
                    getProfile={(mode) => DATA_PROFILES[mode as DataConversionMode]}
                    type="data"
                />
            </div>

            {!hasFiles && (
                <p className="flex items-center justify-center text-center text-xs text-dark-400 mt-6 max-w-lg mb-12">
                    <Lock className="w-3 h-3 mr-1.5 shrink-0" /> Confidential data? Conversions happen entirely in your browser memory. No data is ever sent to a server.
                </p>
            )}

            {!embedded && <RelatedTools currentTool="data" />}

            {!embedded && <GenericSEOContent toolId="data" />}

            {!embedded && (
                <div className="w-full relative z-10">
                    <Features />
                </div>
            )}
        </div>
    )
}
