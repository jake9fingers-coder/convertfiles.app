import { useState } from 'react'
import { X, Play, RefreshCw, FileText, CheckCircle, Plus, Trash2, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { DATA_PROFILES } from '../lib/dataConversionProfiles'
import type { BatchDataItem } from '../pages/DataConverter'

interface BatchDataConversionListProps {
    batch: BatchDataItem[]
    updateAllItems: (updates: Partial<BatchDataItem>) => void
    removeItem: (id: string) => void
    onConvertAll: () => void
    isConvertingBatch: boolean
    onAddMore?: (files: File[]) => void
    onClearBatch?: () => void
    onDownloadAll?: () => void
}

function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BatchDataConversionList({
    batch, updateAllItems, removeItem, onConvertAll, isConvertingBatch, onAddMore, onClearBatch, onDownloadAll
}: BatchDataConversionListProps) {

    const pendingCount = batch.filter(i => i.status === 'pending' || i.status === 'error').length
    const firstPendingItem = batch.find(i => i.status === 'pending' || i.status === 'error') || batch[0]
    const globalMode = firstPendingItem?.mode
    const [isExpanded, setIsExpanded] = useState(false)
    const allDone = batch.length > 0 && batch.every(i => i.status === 'done' || i.status === 'error')
    const hasSuccessful = batch.some(i => i.status === 'done' && i.result)

    const allProfilesList = Object.values(DATA_PROFILES)
    const availableProfilesList = firstPendingItem
        ? allProfilesList.filter(p => {
            const ext = firstPendingItem.file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || ''
            return p.acceptedInputs.includes(ext) || p.acceptedInputs.includes(firstPendingItem.file.type)
        })
        : allProfilesList

    const displayProfiles = availableProfilesList.length > 0 ? availableProfilesList : allProfilesList

    const downloadResult = async (result: any, profile: any) => {
        const nameParts = result.filename.split('.')
        const ext = nameParts.pop() || profile.outputExtension
        const base = nameParts.join('.')
        const finalName = `${base} _convertfiles.app.${ext} `

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: finalName,
                    types: [{ description: `${ext.toUpperCase()} file`, accept: { [result.blob.type]: [`.${ext} `] } }],
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
        a.download = finalName
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
                        <div className="flex items-center gap-2">
                            {(onClearBatch && !allDone) && (
                                <button
                                    onClick={onClearBatch}
                                    disabled={isConvertingBatch}
                                    className="flex items-center gap-2 text-dark-500 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    title="Clear Batch"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            {(onClearBatch && allDone) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClearBatch();
                                    }}
                                    className="flex items-center justify-center gap-2 px-3 py-2 text-dark-700 bg-white border border-dark-200 hover:bg-dark-50 hover:border-dark-300 font-medium rounded-lg transition-colors text-sm shadow-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Convert another file
                                </button>
                            )}
                            {onAddMore && !allDone && (
                                <label
                                    className={`flex items - center gap - 2 px - 3 py - 2 rounded - lg text - sm font - medium transition - colors border shadow - sm cursor - pointer
                                        ${isConvertingBatch ? 'opacity-50 pointer-events-none' : 'bg-white text-dark-700 border-dark-200 hover:border-brand-400 hover:bg-brand-50'} `}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                onAddMore(Array.from(e.target.files));
                                            }
                                            e.target.value = '';
                                        }}
                                    />
                                    <Plus className="w-4 h-4" />
                                    Add more
                                </label>
                            )}
                            {pendingCount > 0 && (
                                <button
                                    onClick={onConvertAll}
                                    disabled={isConvertingBatch}
                                    className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm ml-2"
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
                    </div>
                )}

                {pendingCount > 0 && !isConvertingBatch && globalMode && (
                    <div className={`flex flex - col gap - 4 ${batch.length > 1 ? 'p-4' : 'p-5'} `}>
                        <div className="flex flex-col gap-3">
                            <span className="text-sm font-medium text-dark-700">Output Format:</span>

                            <div className="flex flex-wrap items-center gap-2">
                                {displayProfiles.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => updateAllItems({ mode: p.id })}
                                        className={`px - 4 py - 2 rounded - xl text - sm font - semibold transition - all border shadow - sm
                                            ${globalMode === p.id
                                                ? 'bg-brand-500 text-white border-brand-500 shadow-brand-500/20'
                                                : 'bg-white text-dark-900 border-dark-200 hover:border-brand-400 hover:bg-dark-50'
                                            } `}
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
                                    className="flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {isConvertingBatch ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4 fill-current" />
                                    )}
                                    {isConvertingBatch ? 'Converting...' : `Convert to ${DATA_PROFILES[globalMode as keyof typeof DATA_PROFILES].label} `}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* If all done and multiple files, show the stack header */}
            {allDone && batch.length > 1 && hasSuccessful && (
                <div className="bg-white border border-brand-200 rounded-xl shadow-sm p-4 overflow-hidden mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-dark-50/50 transition-colors relative">
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Multi-Thumbnail Stack */}
                        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                            {batch.slice(0, 3).reverse().map((item: any, i: number) => {
                                const total = Math.min(3, batch.length);
                                const revIndex = total - 1 - i;
                                const rotation = revIndex === 0 ? 0 : revIndex === 1 ? -6 : 6;
                                const scale = 1 - (revIndex * 0.1);
                                return (
                                    <div
                                        key={item.id}
                                        className="absolute w-10 h-10 rounded-md overflow-hidden bg-white border border-dark-200 shadow-sm flex items-center justify-center shrink-0"
                                        style={{
                                            transform: `rotate(${rotation}deg) scale(${scale})`,
                                            zIndex: 10 - revIndex
                                        }}
                                    >
                                        <FileText className="w-5 h-5 text-dark-400" />
                                    </div>
                                )
                            })}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-dark-900 flex items-center gap-2 whitespace-nowrap">
                                <CheckCircle className="w-4 h-4 text-success-500 shrink-0" />
                                <span className="truncate">Batch Conversion Complete</span>
                            </p>
                            <p className="text-xs text-dark-500 mt-1 whitespace-nowrap truncate">
                                {batch.filter(i => i.status === 'done').length} files converted successfully.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-auto w-full sm:w-auto justify-end mt-4 sm:mt-0">
                        {onDownloadAll && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownloadAll();
                                }}
                                className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
                            >
                                <Download className="w-4 h-4" />
                                Download All
                            </button>
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-dark-50 hover:bg-dark-100 text-dark-700 font-semibold rounded-lg transition-colors border border-dark-200 text-sm whitespace-nowrap"
                        >
                            {isExpanded ? (
                                <>Collapse <ChevronUp className="w-4 h-4" /></>
                            ) : (
                                <>Expand <ChevronDown className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {(!allDone || isExpanded || batch.length === 1) && (
                <div className="space-y-3">
                    {batch.map(item => {
                        const profile = DATA_PROFILES[item.mode as keyof typeof DATA_PROFILES]

                        return (
                            <div key={item.id} className="bg-white border border-dark-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                                {item.status === 'converting' && (
                                    <div
                                        className="absolute bottom-0 left-0 h-1 bg-brand-500 transition-all duration-300"
                                        style={{ width: `${item.progress}% ` }}
                                    />
                                )}

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w - 12 h - 12 flex items - center justify - center rounded - lg flex - shrink - 0 overflow - hidden relative ${item.status === 'done' ? 'bg-transparent border border-dark-200 shadow-sm' : 'bg-dark-50 text-dark-400'} `}>
                                            <FileText className="w-5 h-5 text-dark-400" />
                                            {item.status === 'done' && (
                                                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 text-success-500 drop-shadow-md" />
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
                                        ) : item.status === 'done' && item.result ? (
                                            <button
                                                onClick={() => downloadResult(item.result!, profile)}
                                                className="text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 px-4 py-1.5 rounded-lg transition-colors"
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
            )
            }
        </div >
    )
}
