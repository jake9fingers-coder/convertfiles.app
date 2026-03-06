import { X, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProgressDisplayProps {
    progress: number
    logMessages: string[]
    onCancel: () => void
}

export default function ProgressDisplay({ progress, logMessages, onCancel }: ProgressDisplayProps) {
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
        setElapsed(0)
        const interval = setInterval(() => setElapsed(s => s + 1), 1000)
        return () => clearInterval(interval)
    }, [])

    const formatElapsed = (s: number) =>
        s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`

    const hasProgress = progress > 0

    return (
        <div className="bg-white border border-dark-200 rounded-xl shadow-sm p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-500 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm font-semibold text-dark-900">Converting…</span>
                    <span className="text-xs text-dark-400 tabular-nums">{formatElapsed(elapsed)}</span>
                </div>
                <button
                    onClick={onCancel}
                    className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                    aria-label="Cancel conversion"
                >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                </button>
            </div>

            {/* Progress bar */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-dark-500">Processing</span>
                    <span className="text-xs font-semibold text-brand-600">
                        {hasProgress ? `${progress}%` : 'Working…'}
                    </span>
                </div>
                <div className="w-full bg-dark-100 rounded-full h-2 overflow-hidden">
                    {hasProgress ? (
                        <div
                            className="h-2 rounded-full progress-shimmer transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    ) : (
                        <div className="h-2 rounded-full w-full relative overflow-hidden bg-dark-100">
                            <div
                                className="absolute top-0 h-2 rounded-full bg-brand-500"
                                style={{ width: '40%', animation: 'indeterminate 1.5s ease-in-out infinite' }}
                            />
                            <style>{`
                @keyframes indeterminate {
                  0%   { left: -40%; }
                  60%  { left: 100%; }
                  100% { left: 100%; }
                }
              `}</style>
                        </div>
                    )}
                </div>
                <p className="text-xs text-dark-400 mt-1.5">
                    Large files may take a minute - processing happens locally in your browser
                </p>
            </div>

            {/* Conversion log output */}
            <div
                className="bg-dark-900 rounded-lg p-4 h-28 overflow-y-auto font-mono text-xs text-dark-400 space-y-0.5"
                aria-label="Conversion log"
                aria-live="polite"
            >
                {logMessages.length === 0 ? (
                    <span className="text-dark-600">Waiting for engine…</span>
                ) : (
                    logMessages.map((msg, i) => (
                        <div key={i} className={`leading-relaxed ${i === logMessages.length - 1 ? 'text-dark-200' : ''}`}>
                            <span className="text-dark-600 select-none">{'>'} </span>
                            {msg}
                        </div>
                    ))
                )}
            </div>

            <p className="flex justify-center items-center text-xs text-center text-dark-400">
                <Lock className="w-3 h-3 mr-1.5" /> Processing entirely in your browser - nothing is being uploaded
            </p>
        </div>
    )
}
