import { Download, RotateCcw, CheckCircle } from 'lucide-react'
import type { ConversionResult } from '../hooks/useFFmpeg'
import { PROFILES } from '../lib/conversionProfiles'
import type { ConversionMode } from '../lib/conversionProfiles'

interface OutputCardProps {
    result: ConversionResult
    mode: ConversionMode
    onReset: () => void
}

function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function OutputCard({ result, mode, onReset }: OutputCardProps) {
    const profile = PROFILES[mode]
    const savings = result.originalSize > 0
        ? Math.round((1 - result.outputSize / result.originalSize) * 100)
        : 0

    const download = async () => {
        // Prefer showSaveFilePicker (native OS Save dialog) — bypasses COEP/blob URL issues entirely
        if ('showSaveFilePicker' in window) {
            try {
                const ext = profile.outputExtension
                const handle = await (window as typeof window & {
                    showSaveFilePicker: (opts: object) => Promise<FileSystemFileHandle>
                }).showSaveFilePicker({
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
            } catch {
                // User cancelled — don't fall through to blob download
                return
            }
        }

        // Fallback for Firefox/Safari: blob URL download (may not preserve filename on all browsers)
        const tempUrl = URL.createObjectURL(result.blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = tempUrl
        a.download = result.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(tempUrl), 250)
    }

    // Truncate very long filenames for display only
    const displayName = result.filename.length > 60
        ? result.filename.slice(0, 40) + '…' + result.filename.slice(-10)
        : result.filename

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
            {/* Success header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">Conversion Complete!</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{displayName}</p>
                </div>
            </div>

            {/* Preview — GIF uses img, video modes use video element */}
            {mode === 'gif' && (
                <div className="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                        src={result.url}
                        alt="Converted GIF preview"
                        className="max-h-64 object-contain"
                    />
                </div>
            )}
            {(mode === 'mp4' || mode === 'webm' || mode === 'compress') && (
                <div className="rounded-xl overflow-hidden bg-gray-950">
                    <video
                        src={result.url}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full max-h-64 object-contain"
                        aria-label="Converted video preview"
                    />
                </div>
            )}
            {mode === 'mp3' && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <audio controls src={result.url} className="w-full" aria-label="Converted audio preview" />
                </div>
            )}

            {/* Size comparison */}
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">Original</p>
                    <p className="text-sm font-semibold text-gray-700">{formatBytes(result.originalSize)}</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                    <p className="text-xs text-emerald-600 mb-1">Saved</p>
                    <p className="text-sm font-bold text-emerald-700">
                        {savings > 0 ? `${savings}%` : savings < 0 ? `+${Math.abs(savings)}%` : '—'}
                    </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">Output</p>
                    <p className="text-sm font-semibold text-gray-700">{formatBytes(result.outputSize)}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={download}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 active:scale-[0.98] transition-all duration-150 shadow-md"
                    aria-label="Download converted file"
                >
                    <Download className="w-4 h-4" />
                    Download {profile.outputExtension.toUpperCase()}
                </button>
                <button
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 active:scale-[0.98] transition-all duration-150 border border-gray-200"
                    aria-label="Convert another file"
                >
                    <RotateCcw className="w-4 h-4" />
                    Another
                </button>
            </div>
        </div>
    )
}
