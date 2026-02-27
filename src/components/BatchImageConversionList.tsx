import { useState, useEffect } from 'react'
import { X, Play, RefreshCw, ImageIcon, CheckCircle } from 'lucide-react'
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
        return <ImageIcon className="w-5 h-5 text-gray-400" />
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

    // Separate popular formats to display prominently vs hidden under 'More'
    const popularKeys = ['webp', 'jpeg', 'png', 'gif']
    const allProfilesList = Object.values(IMAGE_PROFILES)
    const popularProfiles = allProfilesList.filter(p => popularKeys.includes(p.id))
    const moreProfiles = allProfilesList.filter(p => !popularKeys.includes(p.id))

    // Download a single result
    const downloadResult = async (result: any, profile: any) => {
        if ('showSaveFilePicker' in window) {
            try {
                const ext = profile.outputExtension
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: result.filename,
                    types: [{
                        description: `${ext.toUpperCase()} file`,
                        accept: { [result.blob.type]: [`.${ext}`] },
                    }],
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
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden mb-6">
                {/* Only show the Batch Header if there is > 1 file */}
                {batch.length > 1 && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                        <span className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-900">
                                Batch Queue <span className="text-gray-400 font-normal ml-1">({batch.length} files)</span>
                            </span>
                        </span>
                        {pendingCount > 0 && (
                            <button
                                onClick={onConvertAll}
                                disabled={isConvertingBatch}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
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

                {/* Global Settings Panel (Used for both single and batch) */}
                {pendingCount > 0 && !isConvertingBatch && globalMode && (
                    <div className={`flex flex-col gap-4 ${batch.length > 1 ? 'p-4' : 'p-5'}`}>
                        <div className="flex flex-col gap-3">
                            <span className="text-sm font-medium text-gray-700">Output Format:</span>

                            {/* Format Buttons Group */}
                            <div className="flex flex-wrap items-center gap-2">
                                {popularProfiles.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => updateAllItems({ mode: p.id })}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm
                                            ${globalMode === p.id
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}
                                        `}
                                    >
                                        {p.label}
                                    </button>
                                ))}

                                {/* 'More' Toggle Button */}
                                <button
                                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm
                                        ${showMoreOptions || (moreProfiles.some(m => m.id === globalMode)) // Keep it highlighted if a hidden option is active
                                            ? 'bg-gray-100 text-gray-900 border-gray-300'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {showMoreOptions ? 'Less Options -' : 'More Options +'}
                                </button>
                            </div>

                            {/* Expanded Hidden Options */}
                            {showMoreOptions && (
                                <div className="flex flex-wrap justify-start items-center gap-2 mt-2 pt-3 border-t border-gray-100 animate-slide-up">
                                    {moreProfiles.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => updateAllItems({ mode: p.id })}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border shadow-sm
                                                ${globalMode === p.id
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}
                                            `}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Convert / Action Button aligned at the bottom */}
                        {batch.length === 1 && (
                            <div className="flex justify-end mt-2 pt-4 border-t border-gray-50">
                                <button
                                    onClick={onConvertAll}
                                    disabled={isConvertingBatch}
                                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {isConvertingBatch ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4 fill-current" />
                                    )}
                                    {isConvertingBatch ? 'Converting...' : `Convert to ${IMAGE_PROFILES[globalMode].label}`}
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

                    return (
                        <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">

                            {/* Background Progress Bar (if converting) */}
                            {item.status === 'converting' && (
                                <div
                                    className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300"
                                    style={{ width: `${item.progress}%` }}
                                />
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0 overflow-hidden relative ${item.status === 'done' ? 'bg-transparent border border-gray-100 shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
                                        {item.status === 'done' && item.result ? (
                                            <img
                                                src={item.result.url}
                                                alt="Preview"
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FileThumbnail file={item.file} />
                                        )}

                                        {/* Fallback checkmark overlaid for success state on formats where thumbnails might fail to render */}
                                        {item.status === 'done' && (
                                            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-emerald-500 drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 max-w-[200px]">
                                        <p className="text-sm font-medium text-gray-900 truncate" title={item.file.name}>
                                            {item.file.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>{formatBytes(item.file.size)}</span>
                                            {item.status === 'error' && (
                                                <span className="text-red-500 font-medium truncate">{item.error}</span>
                                            )}
                                        </div>
                                        {/* Extension match warning */}
                                        {(item.status === 'pending' || item.status === 'error') && globalMode && (
                                            item.file.name.toLowerCase().endsWith(`.${IMAGE_PROFILES[globalMode].outputExtension.toLowerCase()}`)
                                        ) && (
                                                <p className="text-xs text-amber-600 font-medium mt-0.5">
                                                    Already .{IMAGE_PROFILES[globalMode].outputExtension.toUpperCase()}
                                                </p>
                                            )}
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-3 pl-14 sm:pl-0">
                                    {item.status === 'pending' || item.status === 'error' ? (
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            disabled={isConvertingBatch}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    ) : item.status === 'converting' ? (
                                        <span className="text-sm font-medium text-indigo-600 flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            {item.progress}%
                                        </span>
                                    ) : item.status === 'done' && item.result && batch.length > 1 ? (
                                        <button
                                            onClick={() => downloadResult(item.result!, profile)}
                                            className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 px-4 py-1.5 rounded-lg transition-colors"
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
