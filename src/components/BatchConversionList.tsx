import { useState, useEffect } from 'react'
import { X, Play, RefreshCw, FileVideo, Music, CheckCircle } from 'lucide-react'
import type { ConversionMode } from '../lib/conversionProfiles'
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
        return file.type.startsWith('audio') ? <Music className="w-5 h-5 text-gray-400" /> : <FileVideo className="w-5 h-5 text-gray-400" />
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

    // Download a single result
    const downloadResult = async (result: ConversionResult, profile: any) => {
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

                {/* Global Settings Panel */}
                {pendingCount > 0 && !isConvertingBatch && globalMode && (
                    <div className="p-4 bg-white flex flex-col sm:flex-row gap-6 sm:items-center">
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-medium text-gray-700">Output Format:</span>
                            <select
                                value={globalMode}
                                onChange={e => updateAllItems({ mode: e.target.value as ConversionMode })}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm"
                            >
                                {Object.values(PROFILES).map(p => (
                                    <option key={p.id} value={p.id}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 w-full max-w-md sm:border-l sm:border-gray-100 sm:pl-6">
                            {globalMode === 'gif' ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>FPS</span>
                                            <span className="font-medium text-gray-900">{globalOptions?.gifFps}</span>
                                        </div>
                                        <input
                                            type="range" min="5" max="30" step="1"
                                            value={globalOptions?.gifFps}
                                            onChange={e => updateAllItems({ options: { ...globalOptions!, gifFps: Number(e.target.value) } })}
                                            className="w-full accent-indigo-600"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Width (px)</span>
                                            <span className="font-medium text-gray-900">{globalOptions?.gifWidth}</span>
                                        </div>
                                        <input
                                            type="range" min="320" max="1080" step="10"
                                            value={globalOptions?.gifWidth}
                                            onChange={e => updateAllItems({ options: { ...globalOptions!, gifWidth: Number(e.target.value) } })}
                                            className="w-full accent-indigo-600"
                                        />
                                    </div>
                                </div>
                            ) : globalMode !== 'mp3' ? (
                                <div className="space-y-1 w-full">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Smaller File</span>
                                        <span className="font-medium text-gray-900">{globalOptions?.quality}% Quality</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="100"
                                        value={globalOptions?.quality}
                                        onChange={e => updateAllItems({ options: { ...globalOptions!, quality: Number(e.target.value) } })}
                                        className="w-full accent-indigo-600"
                                    />
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400 italic">No additional settings for audio extraction.</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Individual Files */}
            <div className="space-y-3">
                {batch.map(item => {
                    const profile = PROFILES[item.mode]

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
                                            item.mode === 'mp3' ? (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50 border border-gray-100 text-gray-400">
                                                    <Music className="w-5 h-5" />
                                                </div>
                                            ) : (
                                                <img
                                                    src={item.result.url}
                                                    alt="Preview"
                                                    // For video files, we can still often generate a thumbnail by putting the video url in an img tag in some browsers, 
                                                    // but a standard video cast works too. For simplicity, we use video tag for video and img for gif
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            )
                                        ) : (
                                            <FileThumbnail file={item.file} />
                                        )}

                                        {/* Fallback checkmark overlaid for success state on audio/video where thumbnails might be tricky */}
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
                                        {(item.status === 'pending' || item.status === 'error') && globalMode && globalMode !== 'compress' && (
                                            item.file.name.toLowerCase().endsWith(`.${PROFILES[globalMode].outputExtension.toLowerCase()}`)
                                        ) && (
                                                <p className="text-xs text-amber-600 font-medium mt-0.5">
                                                    Already .{PROFILES[globalMode].outputExtension.toUpperCase()}
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
                                    ) : item.status === 'done' && item.result ? (
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
