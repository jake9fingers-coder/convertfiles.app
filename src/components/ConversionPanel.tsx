import { Film, Music, Clapperboard, Minimize2, FileVideo } from 'lucide-react'
import type { ConversionMode, ConversionOptions } from '../lib/conversionProfiles'
import { PROFILES } from '../lib/conversionProfiles'

interface ConversionPanelProps {
    file: File
    mode: ConversionMode
    options: ConversionOptions
    onModeChange: (m: ConversionMode) => void
    onOptionsChange: (o: Partial<ConversionOptions>) => void
    onConvert: () => void
    loading: boolean
}

const ICONS: Record<ConversionMode, React.ReactNode> = {
    gif: <Clapperboard className="w-5 h-5" />,
    compress: <Minimize2 className="w-5 h-5" />,
    webm: <FileVideo className="w-5 h-5" />,
    mp3: <Music className="w-5 h-5" />,
    mp4: <Film className="w-5 h-5" />,
}

function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ConversionPanel({
    file, mode, options, onModeChange, onOptionsChange, onConvert, loading,
}: ConversionPanelProps) {
    return (
        <div className="bg-white border border-dark-200 rounded-xl shadow-sm p-6 space-y-6 animate-slide-up">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-lg border border-dark-100">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Film className="w-5 h-5 text-brand-500" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-dark-900 truncate">{file.name}</p>
                    <p className="text-xs text-dark-400">{formatBytes(file.size)}</p>
                </div>
            </div>

            {/* Output format selector */}
            <div>
                <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3">Output Format</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.values(PROFILES)).map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => onModeChange(profile.id)}
                            className={`
                flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all duration-150 group
                ${mode === profile.id
                                    ? 'border-brand-500 bg-brand-50 shadow-sm'
                                    : 'border-dark-200 bg-white hover:border-dark-300 hover:bg-dark-50'
                                }
              `}
                        >
                            <div className={`${mode === profile.id ? 'text-brand-500' : 'text-dark-400 group-hover:text-dark-600'} transition-colors`}>
                                {ICONS[profile.id]}
                            </div>
                            <span className={`text-sm font-semibold ${mode === profile.id ? 'text-brand-700' : 'text-dark-700'}`}>
                                {profile.label}
                            </span>
                            <span className="text-xs text-dark-400 leading-snug">{profile.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quality slider */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider">Quality</p>
                    <span className="text-xs text-dark-400">{options.quality}%</span>
                </div>
                <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={options.quality}
                    onChange={e => onOptionsChange({ quality: Number(e.target.value) })}
                    className="w-full accent-brand-500 h-1.5 rounded-full"
                    aria-label="Quality setting"
                />
                <div className="flex justify-between text-xs text-dark-400 mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                </div>
            </div>

            {/* GIF-specific options */}
            {mode === 'gif' && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dark-100">
                    <div>
                        <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">Frame Rate</label>
                        <select
                            value={options.gifFps}
                            onChange={e => onOptionsChange({ gifFps: Number(e.target.value) })}
                            className="w-full text-sm border border-dark-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                            aria-label="GIF frame rate"
                        >
                            {[10, 15, 20, 24, 30].map(fps => (
                                <option key={fps} value={fps}>{fps} fps</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">Max Width</label>
                        <select
                            value={options.gifWidth}
                            onChange={e => onOptionsChange({ gifWidth: Number(e.target.value) })}
                            className="w-full text-sm border border-dark-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                            aria-label="GIF max width"
                        >
                            {[320, 480, 640, 800, 1080].map(w => (
                                <option key={w} value={w}>{w}px</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Convert button */}
            <button
                onClick={onConvert}
                disabled={loading}
                className="w-full py-4 px-6 text-base font-semibold bg-accent-500 text-white rounded-lg hover:bg-accent-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm hover:shadow-md"
                aria-label="Start conversion"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading FFmpeg…
                    </span>
                ) : (
                    `Convert to ${PROFILES[mode].outputExtension.toUpperCase()}`
                )}
            </button>
        </div>
    )
}
