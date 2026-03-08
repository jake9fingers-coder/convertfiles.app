import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileVideo, Music, Download, Trash2, RefreshCw, ArrowRight, CheckCircle, ChevronDown, ChevronUp, FolderArchive, Plus } from 'lucide-react'
import JSZip from 'jszip'

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

interface ConversionHistoryListProps {
    history: any[]
    onReuse: (item: any) => void
    onRemove: (id: string) => void
    onClearAll: () => void
    getProfile: (mode: string) => any
    type?: 'video' | 'image' | 'data' | 'document'
    isFullHistoryPage?: boolean
}

export default function ConversionHistoryList({ history, onReuse, onRemove, onClearAll, getProfile, type, isFullHistoryPage = false }: ConversionHistoryListProps) {
    const [confirmClear, setConfirmClear] = useState(false)
    const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set())

    const displayHistory = isFullHistoryPage ? history : history.slice(0, 10)

    useEffect(() => {
        if (confirmClear) {
            const timer = setTimeout(() => setConfirmClear(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [confirmClear])

    if (history.length === 0) return null

    const toggleBatch = (batchId: string) => {
        setExpandedBatches(prev => {
            const newSet = new Set(prev)
            if (newSet.has(batchId)) {
                newSet.delete(batchId)
            } else {
                newSet.add(batchId)
            }
            return newSet
        })
    }

    const downloadResult = async (result: any, profile: any) => {
        const nameParts = result.filename.split('.')
        const ext = nameParts.pop() || profile?.outputExtension || ''
        const base = nameParts.join('.')
        const finalName = `${base}_convertfiles.app.${ext}`

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: finalName,
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
        a.download = finalName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(tempUrl), 250)
    }

    const downloadAll = async (items: any[]) => {
        let writable: any = null;
        let useFallback = true;

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: 'saved_batch_convertfiles-app.zip',
                    types: [{ description: 'ZIP Archive', accept: { 'application/zip': ['.zip'] } }],
                });
                writable = await handle.createWritable();
                useFallback = false;
            } catch (err: any) {
                if (err.name === 'AbortError') return;
            }
        }

        try {
            const zip = new JSZip();
            const usedNames = new Set<string>();

            items.forEach((item) => {
                if (item.result) {
                    const profile = getProfile(item.mode);
                    const nameParts = item.result.filename.split('.');
                    const ext = nameParts.pop() || profile?.outputExtension || '';
                    const base = nameParts.join('.');

                    let finalName = `${base}_convertfiles.app.${ext}`;
                    let counter = 1;

                    while (usedNames.has(finalName)) {
                        finalName = `${base}_convertfiles.app (${counter}).${ext}`;
                        counter++;
                    }

                    usedNames.add(finalName);
                    zip.file(finalName, item.result.blob);
                }
            });

            const zipBlob = await zip.generateAsync({ type: 'blob' });

            if (!useFallback && writable) {
                await writable.write(zipBlob);
                await writable.close();
            } else {
                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'saved_batch_convertfiles-app.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        } catch (e) {
            console.error("Zipping failed:", e);
            alert("Oops, failed to build ZIP file.");
        }
    }

    return (
        <div className="w-full space-y-4 animate-slide-up mt-12 mb-8">
            <div className="bg-white border border-dark-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-dark-100 bg-dark-50/50">
                    <span className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-dark-900">
                            Conversion History <span className="text-dark-400 font-normal ml-1">({history.flat().length} items)</span>
                        </span>
                    </span>
                    <button
                        onClick={() => {
                            if (confirmClear) {
                                onClearAll();
                                setConfirmClear(false);
                            } else {
                                setConfirmClear(true);
                            }
                        }}
                        className={`text-xs font-medium transition-colors px-2 py-1 rounded ${confirmClear
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'text-dark-500 hover:text-red-600'
                            }`}
                    >
                        {confirmClear ? 'Confirm Clear' : 'Clear All'}
                    </button>
                </div>

                <div className="space-y-0 divide-y divide-dark-50">
                    {displayHistory.map((historyEntry, index) => {
                        // Handle single item vs batch group
                        const isBatch = Array.isArray(historyEntry)
                        const items = isBatch ? historyEntry : [historyEntry]
                        const batchId = isBatch ? `batch-${index}-${items[0].id}` : items[0].id
                        const isExpanded = expandedBatches.has(batchId)

                        const renderItem = (item: any, isInsideBatch: boolean = false) => {
                            const profile = getProfile(item.mode)
                            const isSuccess = item.status === 'done' && item.result

                            return (
                                <div key={item.id} className={`p-4 hover:bg-dark-50 transition-colors flex items-center justify-between group ${isInsideBatch ? 'bg-dark-50/30' : ''}`}>
                                    <div className="flex items-center gap-4 min-w-0">
                                        {isSuccess ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden bg-dark-100 relative shrink-0 border border-dark-200">
                                                    <FileThumbnail file={item.file} />
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-dark-300 shrink-0" />
                                                <div className="w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden bg-transparent relative shrink-0 border border-dark-200 shadow-sm">
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
                                            <div className="w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden bg-dark-100 relative shrink-0 border border-dark-200">
                                                <FileThumbnail file={item.file} />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-dark-900 truncate" title={item.file.name}>
                                                {item.file.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-dark-400 mt-0.5">
                                                <span>{formatBytes(item.file.size)}</span>
                                                <span>→</span>
                                                <span className="font-medium text-brand-600 truncate">{profile?.label || item.mode}</span>
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
                                                className="p-1.5 text-dark-500 hover:text-dark-900 hover:bg-dark-200 rounded-md transition-colors"
                                                title="Download again"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onReuse(item)}
                                            className="p-1.5 text-dark-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                                            title="Reuse (Adjust settings & convert again)"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onRemove(isInsideBatch ? batchId : item.id)}
                                            className="p-1.5 text-dark-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Remove from history"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        }

                        if (!isBatch) {
                            return renderItem(items[0], false)
                        }

                        // Render Batch Container UI
                        const successfulItems = items.filter((i: any) => i.status === 'done' && i.result)
                        const failedCount = items.length - successfulItems.length
                        const stackItems = items.slice(0, Math.min(3, items.length))

                        return (
                            <div key={batchId} className="flex flex-col border-b border-dark-50 last:border-0 relative bg-white">
                                <div className="p-4 flex items-center justify-between group hover:bg-dark-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        {/* Multi-Thumbnail Stack */}
                                        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                                            {stackItems.length > 0 ? (
                                                stackItems.slice().reverse().map((item: any, i: number) => {
                                                    const total = stackItems.length;
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
                                                            <FileThumbnail file={item.file} />
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand-50 border border-brand-100 text-brand-500 shrink-0">
                                                    <FolderArchive className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-dark-900 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-success-500" />
                                                Batch Conversion Complete
                                            </p>
                                            <p className="text-xs text-dark-500 mt-1">
                                                {successfulItems.length} files converted successfully. {failedCount > 0 && `(${failedCount} failed)`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleBatch(batchId)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-dark-700 bg-white border border-dark-200 hover:bg-dark-50 hover:border-dark-300 font-medium rounded-lg transition-colors text-sm shadow-sm"
                                        >
                                            Expand
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => onRemove(batchId)}
                                            className="p-1.5 text-dark-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Remove entire batch from history"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="flex flex-col border-t border-dark-100 bg-dark-50/30 divide-y divide-dark-50/50 pl-8 pb-2">
                                        {items.map((item: any) => renderItem(item, true))}

                                        {/* Batch Actions Footer */}
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 pr-6 mt-2">
                                            <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
                                                <button
                                                    onClick={() => onReuse(items[0])} // Reuses the first item's type to start a new conversion of that type
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-dark-700 bg-white border border-dark-200 hover:bg-dark-50 hover:border-dark-300 font-medium rounded-lg transition-colors text-sm shadow-sm"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Convert another file
                                                </button>
                                                {successfulItems.length > 0 && (
                                                    <button
                                                        onClick={() => downloadAll(successfulItems)}
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download All
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Pagination / Full History Navigation */}
            {!isFullHistoryPage && history.length > 10 && (
                <div className="flex justify-center mt-6">
                    <Link
                        to={`/history${type ? `?type=${type}` : ''}`}
                        className="px-6 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-600 font-semibold rounded-xl transition-all duration-200 border border-brand-200 text-sm flex items-center gap-2 shadow-sm hover:shadow active:scale-[0.98] group"
                    >
                        View Full History
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            )}
        </div>
    )
}
