import { useState, useEffect } from 'react'
import { FileVideo, Music, Download, Trash2, RefreshCw } from 'lucide-react'

function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

interface ConversionHistoryListProps {
    history: any[]
    onReuse: (item: any) => void
    onRemove: (id: string) => void
    onClearAll: () => void
    getProfile: (mode: string) => any
}

export default function ConversionHistoryList({ history, onReuse, onRemove, onClearAll, getProfile }: ConversionHistoryListProps) {
    if (history.length === 0) return null

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
        <div className="w-full space-y-4 animate-slide-up mt-12 mb-8">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                    <span className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">
                            Conversion History <span className="text-gray-400 font-normal ml-1">({history.length} items)</span>
                        </span>
                    </span>
                    <button
                        onClick={onClearAll}
                        className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
                    >
                        Clear All
                    </button>
                </div>

                <div className="space-y-0 divide-y divide-gray-50">
                    {history.map(item => {
                        const profile = getProfile(item.mode)
                        const isSuccess = item.status === 'done' && item.result

                        return (
                            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden bg-gray-100 relative shrink-0 border border-gray-200">
                                        <FileThumbnail file={item.file} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate" title={item.file.name}>
                                            {item.file.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                            <span>{formatBytes(item.file.size)}</span>
                                            <span>→</span>
                                            <span className="font-medium text-indigo-600 truncate">{profile?.label || item.mode}</span>
                                            {item.status === 'error' && (
                                                <span className="text-red-500 font-medium ml-2 truncate" title={item.error}>Failed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                    {isSuccess && (
                                        <button
                                            onClick={() => downloadResult(item.result, profile)}
                                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
                                            title="Download again"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onReuse(item)}
                                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                        title="Reuse (Adjust settings & convert again)"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onRemove(item.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Remove from history"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
