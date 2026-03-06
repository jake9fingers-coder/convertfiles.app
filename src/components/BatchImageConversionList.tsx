import { useState, useEffect } from 'react'
import { X, Play, RefreshCw, ImageIcon, CheckCircle, SlidersHorizontal } from 'lucide-react'
import { IMAGE_PROFILES } from '../lib/imageConversionProfiles'
import type { BatchImageItem } from '../pages/ImageConverter'

interface BatchImageConversionListProps {
    batch: BatchImageItem[]
    updateAllItems: (updates: Partial<BatchImageItem>) => void
    removeItem: (id: string) => void
    onConvertAll: () => void
    isConvertingBatch: boolean
}

function FileThumbnail({ file }: { file: File }) {
    const [url, setUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!file.type.startsWith('image/')) return
        const objectUrl = URL.createObjectURL(file)
        setUrl(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
    }, [file])

    if (!url) {
        return <ImageIcon className="w-5 h-5 text-dark-400" />
    }

    return (
        <img
            src={url}
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply group-hover:opacity-100 transition-opacity"
            alt="Preview"
        />
    )
}

function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BatchImageConversionList({
    batch, updateAllItems, removeItem, onConvertAll, isConvertingBatch
}: BatchImageConversionListProps) {

    const pendingCount = batch.filter(i => i.status === 'pending' || i.status === 'error').length
    const firstPendingItem = batch.find(i => i.status === 'pending' || i.status === 'error') || batch[0]
    const globalMode = firstPendingItem?.mode

    const [showMoreOptions, setShowMoreOptions] = useState(false)

    const popularKeys = ['webp', 'jpeg', 'png']
    const allProfilesList = Object.values(IMAGE_PROFILES)
    const popularProfiles = allProfilesList.filter(p => popularKeys.includes(p.id))
    const moreProfiles = allProfilesList.filter(p => !popularKeys.includes(p.id))

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

            {/* Batch List Header & Global Settings */}
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
                                className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
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

                {/* Global Settings Panel */}
                {pendingCount > 0 && !isConvertingBatch && globalMode && (
                    <div className={`flex flex-col gap-4 ${batch.length > 1 ? 'p-4' : 'p-5'}`}>
                        <div className="flex flex-col gap-3">
                            <span className="text-sm font-medium text-dark-700">Output Format:</span>

                            {/* Format Buttons Group */}
                            <div className="flex flex-wrap items-center gap-2">
                                {popularProfiles.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => updateAllItems({ mode: p.id })}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm
                                            ${globalMode === p.id
                                                ? 'bg-brand-500 text-dark-900 border-brand-500'
                                                : 'bg-white text-dark-700 border-dark-200 hover:border-brand-400 hover:bg-brand-50'}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm
                                        ${showMoreOptions || (moreProfiles.some(m => m.id === globalMode))
                                            ? 'bg-dark-100 text-dark-900 border-dark-300'
                                            : 'bg-white text-dark-500 border-dark-200 hover:bg-dark-50'
                                        }`}
                                >
                                    {showMoreOptions ? 'Less Options -' : 'More Options +'}
                                </button>
                            </div>

                            {showMoreOptions && (
                                <div className="flex flex-wrap justify-start items-center gap-2 mt-2 pt-3 border-t border-dark-100 animate-slide-up">
                                    {moreProfiles.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => updateAllItems({ mode: p.id })}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border shadow-sm
                                                ${globalMode === p.id
                                                    ? 'bg-brand-500 text-dark-900 border-brand-500'
                                                    : 'bg-white text-dark-700 border-dark-200 hover:border-brand-400 hover:bg-brand-50'}`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {['jpeg', 'webp', 'avif', 'jxl'].includes(globalMode) && (
                            <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-dark-100">
                                <button
                                    onClick={() => updateAllItems({ compress: !(firstPendingItem?.compress) })}
                                    className={`self-start flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm ${firstPendingItem?.compress
                                        ? 'bg-brand-50 text-brand-700 border-brand-200'
                                        : 'bg-white text-dark-700 border-dark-200 hover:bg-dark-50'
                                        }`}
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Compress Image
                                </button>

                                {firstPendingItem?.compress && (
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up bg-dark-50 p-4 rounded-xl border border-dark-100">
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-dark-900 mb-0.5">Compression Quality</p>
                                            <p className="text-xs text-dark-500">Lower quality reduces file size.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                min="1"
                                                max="100"
                                                value={firstPendingItem?.quality ?? 80}
                                                onChange={(e) => updateAllItems({ quality: parseInt(e.target.value, 10) })}
                                                className="w-32 sm:w-48 accent-brand-500"
                                            />
                                            <span className="text-sm font-semibold text-brand-600 min-w-[2.5rem] text-right">
                                                {firstPendingItem?.quality ?? 80}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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
                                    {isConvertingBatch ? 'Converting...' : IMAGE_PROFILES[globalMode].label}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Individual Files */}
            <div className="space-y-3">
                {batch.map(item => {
                    const profile = IMAGE_PROFILES[item.mode]
                    const isDone = item.status === 'done' && item.result

                    // Determine file extensions
                    const inputExt = (item.file.name.split('.').pop() || '').toUpperCase()
                    const outputExt = profile.outputExtension.toUpperCase()
                    const isSameFormat = inputExt === outputExt

                    // Size comparison - only meaningful for same-format compression
                    const originalSize = item.file.size
                    const outputSize = isDone ? item.result!.blob.size : 0
                    const savings = isDone && isSameFormat && originalSize > 0
                        ? Math.round((1 - outputSize / originalSize) * 100)
                        : 0

                    return (
                        <div key={item.id} className="bg-white border border-dark-200 rounded-xl shadow-sm relative overflow-hidden group">

                            {item.status === 'converting' && (
                                <div
                                    className="absolute bottom-0 left-0 h-1 bg-brand-500 transition-all duration-300"
                                    style={{ width: `${item.progress}%` }}
                                />
                            )}

                            {/* --- DONE: Side-by-side comparison --- */}
                            {isDone ? (
                                <div className="p-4 space-y-4 animate-slide-up">
                                    {/* Success header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-success-500" />
                                            <span className="text-sm font-semibold text-dark-900">Conversion Complete</span>
                                        </div>
                                        {batch.length > 1 && (
                                            <button
                                                onClick={() => downloadResult(item.result!, profile)}
                                                className="text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 px-4 py-1.5 rounded-lg transition-colors"
                                            >
                                                Download
                                            </button>
                                        )}
                                    </div>

                                    {/* Side-by-side image comparison */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Original */}
                                        <div className="flex flex-col items-center gap-2 min-w-0 overflow-hidden">
                                            <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider">Original</span>
                                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-dark-50 border border-dark-200 flex items-center justify-center relative">
                                                <FileThumbnail file={item.file} />
                                            </div>
                                            <div className="text-center w-full overflow-hidden">
                                                <p className="text-xs font-medium text-dark-700 truncate w-full" title={item.file.name}>{item.file.name}</p>
                                                <p className="text-xs text-dark-400">{formatBytes(item.file.size)}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-dark-100 text-dark-500">{inputExt}</span>
                                            </div>
                                        </div>

                                        {/* Converted */}
                                        <div className="flex flex-col items-center gap-2 min-w-0 overflow-hidden">
                                            <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Converted</span>
                                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-dark-50 border border-brand-200 flex items-center justify-center relative">
                                                <img
                                                    src={item.result!.url}
                                                    alt="Converted preview"
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="text-center w-full overflow-hidden">
                                                <p className="text-xs font-medium text-dark-700 truncate w-full" title={item.result!.filename}>{item.result!.filename}</p>
                                                <p className="text-xs text-dark-400">{formatBytes(item.result!.blob.size)}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-brand-100 text-brand-600">{outputExt}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badge: show % for compression, format arrow for conversions */}
                                    <div className="flex justify-center">
                                        {isSameFormat ? (
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${savings > 0
                                                ? 'bg-success-50 text-success-700 border border-success-200'
                                                : savings < 0
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    : 'bg-dark-50 text-dark-500 border border-dark-200'
                                                }`}>
                                                {savings > 0
                                                    ? `${savings}% smaller`
                                                    : savings < 0
                                                        ? `${Math.abs(savings)}% larger`
                                                        : 'Same size'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-200">
                                                {inputExt} → {outputExt}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* --- NOT DONE: Original compact row layout --- */
                                <div className="p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0 overflow-hidden relative bg-dark-50 text-dark-400">
                                                <FileThumbnail file={item.file} />
                                            </div>
                                            <div className={`min-w-0 ${item.status === 'error' ? 'max-w-[300px]' : 'max-w-[200px]'}`}>
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
                                                        <div className="flex items-center gap-3 pt-1">
                                                            <button
                                                                onClick={() => updateAllItems({ status: 'pending', error: null })}
                                                                className="text-xs text-red-700 hover:text-red-900 underline font-medium"
                                                            >
                                                                Try again
                                                            </button>
                                                            <button
                                                                onClick={() => removeItem(item.id)}
                                                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors text-xs font-semibold"
                                                            >
                                                                Try a Different File
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {(item.status === 'pending' || item.status === 'error') && globalMode && (
                                                    item.file.name.toLowerCase().endsWith(`.${IMAGE_PROFILES[globalMode].outputExtension.toLowerCase()}`)
                                                ) && (
                                                        <p className="text-xs text-amber-600 font-medium mt-0.5">
                                                            Already .{IMAGE_PROFILES[globalMode].outputExtension.toUpperCase()}
                                                        </p>
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
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
