import { X, Play, RefreshCw, FileText, CheckCircle } from 'lucide-react'
import { DATA_PROFILES } from '../lib/dataConversionProfiles'
import type { BatchDataItem } from '../pages/DataConverter'

interface BatchDataConversionListProps {
    batch: BatchDataItem[]
    updateAllItems: (updates: Partial<BatchDataItem>) => void
    removeItem: (id: string) => void
    onConvertAll: () => void
    isConvertingBatch: boolean
}

function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BatchDataConversionList({
    batch, updateAllItems, removeItem, onConvertAll, isConvertingBatch
}: BatchDataConversionListProps) {

    const pendingCount = batch.filter(i => i.status === 'pending' || i.status === 'error').length
    const firstPendingItem = batch.find(i => i.status === 'pending' || i.status === 'error') || batch[0]
    const globalMode = firstPendingItem?.mode

    const allProfilesList = Object.values(DATA_PROFILES)

    const downloadResult = async (result: any, profile: any) => {
        if ('showSaveFilePicker' in window) {
            try {
                const ext = profile.outputExtension
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: result.filename,
                    types: [{ description: `${ext.toUpperCase()} file`, accept: { [result.blob.type]: [`.${ext}`] } }],
                })
                const writable = await handle.createWritable()
                await writable.write(result.blob)
                await writable.close()
                return
            } catch { return }
        }
        const tempUrl = URL.createObjectURL(result.blob)
        const a = document.createElement('a')
        a.href = tempUrl
        a.download = result.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(tempUrl), 250)
    }

    return (
        <div className="w-full space-y-4 animate-slide-up">
            <div className="bg-white border border-dark-200 rounded-xl shadow-sm overflow-hidden mb-6">
                {batch.length > 1 && (
                    <div className="flex items-center justify-between p-4 border-b border-dark-100 bg-dark-50/50">
                        <span className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-dark-900">
                                Batch Queue <span className="text-dark-400 font-normal ml-1">({batch.length} files)</span>
                            </span>
                        </span>
                        {pendingCount > 0 && (
                            <button
                                onClick={onConvertAll}
                                disabled={isConvertingBatch}
                                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {isConvertingBatch ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4 fill-current" />
                                )}
                                {isConvertingBatch ? 'Converting...' : 'Convert All'}
                            </button>
                        )}
                    </div>
                )}

                {pendingCount > 0 && !isConvertingBatch && globalMode && (
                    <div className={`flex flex-col gap-4 ${batch.length > 1 ? 'p-4' : 'p-5'}`}>
                        <div className="flex flex-col gap-3">
                            <span className="text-sm font-medium text-dark-700">Output Format:</span>

                            <div className="flex flex-wrap items-center gap-2">
                                {allProfilesList.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => updateAllItems({ mode: p.id })}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border shadow-sm
                                            ${globalMode === p.id
                                                ? 'bg-brand-500 text-white border-brand-500 shadow-brand-500/20'
                                                : 'bg-white text-dark-900 border-dark-200 hover:border-brand-400 hover:bg-dark-50'}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {batch.length === 1 && (
                            <div className="flex justify-end mt-2 pt-4 border-t border-dark-50">
                                <button
                                    onClick={onConvertAll}
                                    disabled={isConvertingBatch}
                                    className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {isConvertingBatch ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4 fill-current" />
                                    )}
                                    {isConvertingBatch ? 'Converting...' : `Convert to ${DATA_PROFILES[globalMode as keyof typeof DATA_PROFILES].label}`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {batch.map(item => {
                    const profile = DATA_PROFILES[item.mode as keyof typeof DATA_PROFILES]

                    return (
                        <div key={item.id} className="bg-white border border-dark-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                            {item.status === 'converting' && (
                                <div
                                    className="absolute bottom-0 left-0 h-1 bg-brand-500 transition-all duration-300"
                                    style={{ width: `${item.progress}%` }}
                                />
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0 overflow-hidden relative ${item.status === 'done' ? 'bg-transparent border border-dark-200 shadow-sm' : 'bg-dark-50 text-dark-400'}`}>
                                        <FileText className="w-5 h-5 text-dark-400" />
                                        {item.status === 'done' && (
                                            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-emerald-500 drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 max-w-[200px]">
                                        <p className="text-sm font-medium text-dark-900 truncate" title={item.file.name}>
                                            {item.file.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-dark-400">
                                            <span>{formatBytes(item.file.size)}</span>
                                        </div>
                                        {item.status === 'error' && (
                                            <div className="mt-2 space-y-1">
                                                <div className="text-red-500 text-xs font-medium pr-2 leading-relaxed whitespace-normal break-words">
                                                    {item.error}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pl-14 sm:pl-0">
                                    {item.status === 'pending' || item.status === 'error' ? (
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            disabled={isConvertingBatch}
                                            className="p-1.5 text-dark-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    ) : item.status === 'converting' ? (
                                        <span className="text-sm font-medium text-brand-500 flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            {item.progress}%
                                        </span>
                                    ) : item.status === 'done' && item.result && batch.length > 1 ? (
                                        <button
                                            onClick={() => downloadResult(item.result!, profile)}
                                            className="text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 px-4 py-1.5 rounded-lg transition-colors"
                                        >
                                            Download
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
