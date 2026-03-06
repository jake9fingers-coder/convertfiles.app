import { Link } from 'react-router-dom'
import { ArrowRight, Film, Image as ImageIcon, FileSpreadsheet, Ruler, DollarSign } from 'lucide-react'

export interface RelatedTool {
    to: string
    label: string
    description: string
    icon: React.ReactNode
}

// All tools in the app - pages reference these by key
const ALL_TOOLS: Record<string, RelatedTool> = {
    video: {
        to: '/',
        label: 'Video & Audio',
        description: 'Convert MP4, MOV, MKV, MP3 and more',
        icon: <Film className="w-6 h-6 text-brand-500" />,
    },
    image: {
        to: '/image-converter',
        label: 'Image Converter',
        description: 'Convert PNG, JPG, WEBP, HEIC, PDF and more',
        icon: <ImageIcon className="w-6 h-6 text-brand-500" />,
    },
    data: {
        to: '/data-converter',
        label: 'Data Converter',
        description: 'Convert JSON, CSV & Excel files',
        icon: <FileSpreadsheet className="w-6 h-6 text-brand-500" />,
    },
    units: {
        to: '/units',
        label: 'Unit Converter',
        description: 'Length, mass, volume, temperature & more',
        icon: <Ruler className="w-6 h-6 text-brand-500" />,
    },
    currency: {
        to: '/currency-converter',
        label: 'Currency Converter',
        description: 'Live exchange rates with historical charts',
        icon: <DollarSign className="w-6 h-6 text-brand-500" />,
    },
}

// Mapping of which tools to show on each page
const RELATED_MAP: Record<string, string[]> = {
    video: ['image', 'data'],
    image: ['video', 'data'],
    data: ['units', 'currency'],
    units: ['currency', 'data'],
    currency: ['units', 'data'],
}

interface RelatedToolsProps {
    /** The key of the current page (e.g. 'video', 'image') */
    currentTool: string
}

export default function RelatedTools({ currentTool }: RelatedToolsProps) {
    const relatedKeys = RELATED_MAP[currentTool] || []
    const tools = relatedKeys.map(k => ALL_TOOLS[k]).filter(Boolean)

    if (tools.length === 0) return null

    return (
        <div className="w-full max-w-2xl mx-auto mt-12 mb-8 px-4">
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-4">Related Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tools.map(tool => (
                    <Link
                        key={tool.to}
                        to={tool.to}
                        className="group flex items-center gap-4 p-4 bg-white border border-dark-200 rounded-xl shadow-sm hover:border-brand-400 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex-shrink-0">{tool.icon}</div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-dark-900 group-hover:text-brand-600 transition-colors">{tool.label}</p>
                            <p className="text-xs text-dark-500 mt-0.5 truncate">{tool.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-dark-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                    </Link>
                ))}
            </div>
        </div>
    )
}
