import { useState, useCallback } from 'react'
import SEOHead from '../components/SEOHead'
import { SITE_URL } from '../lib/seoConversionData'
import type { DataConversionMode } from '../lib/dataConversionProfiles'
import { convertDataFile, type DataConversionResult } from '../hooks/useDataConversion'
import Dropzone from '../components/Dropzone'
import BatchDataConversionList from '../components/BatchDataConversionList'
import Features from '../components/Features'
import RelatedTools from '../components/RelatedTools'

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

    const handleFiles = useCallback((incomingFiles: File[]) => {
        const newBatch = incomingFiles.map(f => ({
            id: crypto.randomUUID(),
            file: f,
            mode: 'json_to_csv' as DataConversionMode,
            status: 'pending' as const,
            progress: 0,
            result: null,
            error: null
        }))
        setBatch(newBatch)
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
                    setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'done', progress: 100, result: res } : p))
                } catch (err: any) {
                    setBatch(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error', error: err.message || String(err), progress: 0 } : p))
                }
            }
        } finally {
            setIsConvertingBatch(false)
        }
    }, [batch])

    const hasFiles = batch.length > 0

    return (
        <div className="w-full flex flex-col items-center">
            <SEOHead
                title="Free Data Converter — JSON to CSV, Excel to JSON & More | convertfiles.app"
                description="Convert JSON to CSV, CSV to Excel, Excel to JSON and more. Free, private, instant data conversion in your browser. No upload needed."
                canonical={`${SITE_URL}/data-converter`}
                keywords={['json to csv', 'csv to json', 'json to excel', 'csv to excel', 'excel to csv', 'data converter', 'free data converter']}
            />
            <div className={`w-full flex flex-col items-center ${embedded ? 'pt-2 pb-4 px-4' : 'min-h-[calc(100vh-140px)] justify-center pt-8 pb-16 px-4'}`}>

                {!embedded && (
                    <div className="w-full mb-8 flex flex-col items-center text-center">
                        <div className="inline-flex items-center justify-center mb-4 bg-brand-50 p-3 rounded-2xl">
                            <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-dark-900 tracking-tight mb-2">
                            Data Converter
                        </h1>
                        <p className="text-base text-dark-500 max-w-sm">
                            Convert JSON to CSV, Excel to JSON, and more securely offline.
                        </p>
                    </div>
                )}

                <div id="converter-tool" className="w-full max-w-xl mx-auto space-y-4 relative z-20">
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
                        />
                    )}
                </div>

                {!hasFiles && (
                    <p className="text-center text-xs text-dark-400 mt-6 max-w-lg mb-12">
                        🔒 Confidential data? Conversions happen entirely in your browser memory. No data is ever sent to a server.
                    </p>
                )}
            </div>

            {!embedded && <RelatedTools currentTool="data" />}

            {!embedded && (
                <div className="w-full relative z-10">
                    <Features />
                </div>
            )}
        </div>
    )
}
