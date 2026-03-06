import { useState, useEffect } from 'react'
import { X, Play, RefreshCw, FileVideo, Music, CheckCircle, ArrowRight } from 'lucide-react'
import { PROFILES } from '../lib/conversionProfiles'
import type { ConversionResult } from '../hooks/useFFmpeg'
import type { BatchItem } from '../pages/VideoConverter'

interface BatchConversionListProps {
    batch: BatchItem[]
    updateAllItems: (updates: Partial<BatchItem>) => void
    removeItem: (id: string) => void
    onConvertAll: () => void
    isConvertingBatch: boolean
}

function FileThumbnail({ file }: { file: File }) {
    const [url, setUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return
        const objectUrl = URL.createObjectURL(file)
        setUrl(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
    }, [file])

    if (!url) {
        return file.type.startsWith('audio') ? <Music className="w-5 h-5 text-dark-400" /> : <FileVideo className="w-5 h-5 text-dark-400" />
    }

    if (file.type.startsWith('video/')) {
        return (
            <video
                src={`${url}#t=0.1`}
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply group-hover:opacity-100 transition-opacity"
                preload="metadata"
                muted
                playsInline
            />
        )
    }

    return (
        <img
            src={url}
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply group-hover:opacity-100 transition-opacity"
            alt="Preview"
        />
    )
}

function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BatchConversionList({
    batch, updateAllItems, removeItem, onConvertAll, isConvertingBatch
}: BatchConversionListProps) {

    const pendingCount = batch.filter(i => i.status === 'pending' || i.status === 'error').length
    const firstPendingItem = batch.find(i => i.status === 'pending' || i.status === 'error') || batch[0]
    const globalMode = firstPendingItem?.mode
    const globalOptions = firstPendingItem?.options

    const downloadResult = async (result: ConversionResult, profile: any) => {
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

                {/* Global Settings Panel */}
                {pendingCount > 0 && !isConvertingBatch && globalMode && (
                    <div className="p-4 bg-white flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <span className="text-sm font-medium text-dark-700">Output Format:</span>
                            <div className="flex flex-wrap items-center gap-2">
                                {Object.values(PROFILES).map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => updateAllItems({ mode: p.id })}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border shadow-sm cursor-pointer
                                            ${globalMode === p.id
                                                ? 'bg-brand-500 text-white border-brand-500 shadow-brand-500/20'
                                                : 'bg-white text-dark-900 border-dark-200 hover:border-brand-400 hover:bg-dark-50'}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 w-full max-w-md sm:border-l sm:border-dark-100 sm:pl-6">
                            {globalMode === 'gif' ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-dark-500">
                                            <span>FPS</span>
                                            <span className="font-medium text-dark-900">{globalOptions?.gifFps}</span>
                                        </div>
                                        <input
                                            type="range" min="5" max="30" step="1"
                                            value={globalOptions?.gifFps}
                                            onChange={e => updateAllItems({ options: { ...globalOptions!, gifFps: Number(e.target.value) } })}
                                            className="w-full accent-brand-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-dark-500">
                                            <span>Width (px)</span>
                                            <span className="font-medium text-dark-900">{globalOptions?.gifWidth}</span>
                                        </div>
                                        <input
                                            type="range" min="320" max="1080" step="10"
                                            value={globalOptions?.gifWidth}
                                            onChange={e => updateAllItems({ options: { ...globalOptions!, gifWidth: Number(e.target.value) } })}
                                            className="w-full accent-brand-500"
                                        />
                                    </div>
                                </div>
                            ) : globalMode === 'compress' ? (
                                <div className="space-y-1 w-full">
                                    <div className="flex justify-between text-xs text-dark-500">
                                        <span>Smaller File</span>
                                        <span className="font-medium text-dark-900">{globalOptions?.quality}% Quality</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="100"
                                        value={globalOptions?.quality}
                                        onChange={e => updateAllItems({ options: { ...globalOptions!, quality: Number(e.target.value) } })}
                                        className="w-full accent-brand-500"
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>

            {/* Individual Files */}
            <div className="space-y-3">
                {batch.map(item => {
                    const profile = PROFILES[item.mode]

                    return (
                        <div key={item.id} className="bg-white border border-dark-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">

                            {/* Background Progress Bar */}
                            {item.status === 'converting' && (
                                <div
                                    className="absolute bottom-0 left-0 h-1 bg-brand-500 transition-all duration-300"
                                    style={{ width: `${item.progress}%` }}
                                />
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                <div className="flex items-center gap-3">
                                    {item.status === 'done' && item.result ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0 overflow-hidden relative bg-transparent border border-dark-200 shadow-sm">
                                                <FileThumbnail file={item.file} />
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-dark-300" />
                                            <div className="w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0 overflow-hidden relative bg-transparent border border-dark-200 shadow-sm">
                                                {item.mode === 'mp3' ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-dark-50 border border-dark-100 text-dark-400">
                                                        <Music className="w-5 h-5" />
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={item.result.url}
                                                        alt="Preview"
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center">
                                                    <CheckCircle className="w-5 h-5 text-success-500 drop-shadow-md" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 flex items-center justify-center rounded-lg flex-shrink-0 overflow-hidden relative bg-dark-50 text-dark-400">
                                            <FileThumbnail file={item.file} />
                                        </div>
                                    )}
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
                                        {(item.status === 'pending' || item.status === 'error') && item.mode && item.mode !== 'compress' && (
                                            item.file.name.toLowerCase().endsWith(`.${PROFILES[item.mode].outputExtension.toLowerCase()}`)
                                        ) && (
                                                <p className="text-xs text-amber-600 font-medium mt-0.5">
                                                    Already .{PROFILES[item.mode].outputExtension.toUpperCase()}
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
        </div>
    )
}
