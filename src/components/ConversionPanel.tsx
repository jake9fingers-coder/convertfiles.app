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
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-6 animate-slide-up">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Film className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                </div>
            </div>

            {/* Output format selector */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Output Format</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.values(PROFILES)).map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => onModeChange(profile.id)}
                            className={`
                flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-150 group
                ${mode === profile.id
                                    ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                    : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'
                                }
              `}
                        >
                            <div className={`${mode === profile.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`}>
                                {ICONS[profile.id]}
                            </div>
                            <span className={`text-sm font-semibold ${mode === profile.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                                {profile.label}
                            </span>
                            <span className="text-xs text-gray-400 leading-snug">{profile.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quality slider */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quality</p>
                    <span className="text-xs text-gray-400">{options.quality}%</span>
                </div>
                <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={options.quality}
                    onChange={e => onOptionsChange({ quality: Number(e.target.value) })}
                    className="w-full accent-indigo-600 h-1.5 rounded-full"
                    aria-label="Quality setting"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                </div>
            </div>

            {/* GIF-specific options */}
            {mode === 'gif' && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Frame Rate
                        </label>
                        <select
                            value={options.gifFps}
                            onChange={e => onOptionsChange({ gifFps: Number(e.target.value) })}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            aria-label="GIF frame rate"
                        >
                            {[10, 15, 20, 24, 30].map(fps => (
                                <option key={fps} value={fps}>{fps} fps</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Max Width
                        </label>
                        <select
                            value={options.gifWidth}
                            onChange={e => onOptionsChange({ gifWidth: Number(e.target.value) })}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            aria-label="GIF max width"
                        >
                            {[320, 480, 640, 800, 1080].map(w => (
                                <option key={w} value={w}>{w}px</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Convert button — same style as Synctile CTA */}
            <button
                onClick={onConvert}
                disabled={loading}
                className="w-full py-4 px-6 text-base font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-md hover:shadow-lg"
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
