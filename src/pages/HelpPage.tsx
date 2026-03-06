import { HelpCircle, FileVideo, Image, Database, ArrowRightLeft, Mail } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import PageBackground from '../components/PageBackground'

const FAQ_ITEMS = [
    {
        question: 'How does the conversion work?',
        answer: 'All conversions happen directly in your browser using WebAssembly technology. Your files are never uploaded to any server.',
    },
    {
        question: 'Is there a file size limit?',
        answer: 'There is no hard file size limit. However, very large files (500MB+) may be slower to process depending on your device\'s memory and processing power.',
    },
    {
        question: 'What formats are supported?',
        answer: 'We support a wide range of formats including MP4, MOV, AVI, WebM, MKV, GIF, MP3, M4A for video/audio; PNG, JPG, WebP, HEIC, BMP, TIFF, AVIF for images; and CSV, JSON, XLSX for data files.',
    },
    {
        question: 'Is my data private?',
        answer: 'Absolutely. Your files never leave your device. Check our Security page for full details.',
    },
    {
        question: 'Can I convert multiple files at once?',
        answer: 'Yes! Our batch conversion feature lets you convert multiple files simultaneously. Just drag and drop all your files at once.',
    },
]

const TOOL_CARDS = [
    { icon: FileVideo, label: 'Video & Audio', path: '/' },
    { icon: Image, label: 'Image Converter', path: '/image-converter' },
    { icon: Database, label: 'Data Converter', path: '/data-converter' },
    { icon: ArrowRightLeft, label: 'Unit Converter', path: '/units' },
]

export default function HelpPage() {
    return (
        <div className="relative w-full flex flex-col items-center">
            <PageBackground />
            <SEOHead
                title="Help & FAQ — convertfiles.app"
                description="Get help with convertfiles.app. Find answers to frequently asked questions about file conversions."
                canonical="https://convertfiles.app/help"
            />
            <div className="w-full max-w-2xl mx-auto min-h-[calc(100vh-140px)] pt-16 pb-16 px-4">
                <div className="flex flex-col items-center text-center mb-12">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-blue-100">
                        <HelpCircle className="w-10 h-10 text-blue-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-dark-900 tracking-tight mb-3">
                        Help & FAQ
                    </h1>
                    <p className="text-base text-dark-500 max-w-md">
                        Find answers to common questions, or explore our tools below.
                    </p>
                </div>

                {/* FAQ */}
                <div className="space-y-4 mb-16">
                    {FAQ_ITEMS.map((item) => (
                        <div
                            key={item.question}
                            className="bg-white border border-dark-200 rounded-2xl p-6 shadow-sm"
                        >
                            <h3 className="text-base font-bold text-dark-900 mb-2">{item.question}</h3>
                            <p className="text-sm text-dark-500 leading-relaxed">{item.answer}</p>
                        </div>
                    ))}
                </div>

                {/* Quick links */}
                <div>
                    <h2 className="text-lg font-bold text-dark-900 mb-4 text-center">Our Tools</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {TOOL_CARDS.map((tool) => (
                            <a
                                key={tool.path}
                                href={tool.path}
                                className="flex items-center gap-3 bg-white border border-dark-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-sm transition-all group"
                            >
                                <tool.icon className="w-5 h-5 text-dark-400 group-hover:text-brand-500 transition-colors" />
                                <span className="text-sm font-semibold text-dark-700 group-hover:text-dark-900 transition-colors">{tool.label}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div className="mt-12 bg-white border border-dark-200 rounded-2xl p-8 text-center">
                    <Mail className="w-6 h-6 text-dark-400 mx-auto mb-3" />
                    <p className="text-sm text-dark-500 font-medium">
                        Still need help? Reach out at <a href="mailto:support@convertfiles.app" className="text-brand-500 font-semibold hover:underline">support@convertfiles.app</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
