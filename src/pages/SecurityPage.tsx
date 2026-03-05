import { Shield, Wifi, HardDrive, Eye } from 'lucide-react'
import SEOHead from '../components/SEOHead'

const SECURITY_POINTS = [
    {
        icon: Wifi,
        title: 'No Server Uploads',
        description: 'Your files never leave your device. All conversions happen 100% in your browser using WebAssembly.',
    },
    {
        icon: HardDrive,
        title: 'Local Processing Only',
        description: 'We use FFmpeg WASM and ImageMagick WASM to process files directly in your browser memory. Nothing is sent over the network.',
    },
    {
        icon: Eye,
        title: 'Zero Tracking of Files',
        description: 'We don\'t log, store, or analyze any of your uploaded files. Your data is yours alone.',
    },
    {
        icon: Shield,
        title: 'Open & Transparent',
        description: 'Our conversion code runs client-side. You can inspect network traffic yourself — you won\'t find any file uploads.',
    },
]

export default function SecurityPage() {
    return (
        <div className="w-full flex flex-col items-center">
            <SEOHead
                title="Security & Privacy — convertfiles.app"
                description="Learn how convertfiles.app keeps your data secure. All conversions happen locally in your browser."
                canonical="https://convertfiles.app/security"
            />
            <div className="w-full max-w-2xl mx-auto min-h-[calc(100vh-140px)] pt-16 pb-16 px-4">
                <div className="flex flex-col items-center text-center mb-12">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-100">
                        <Shield className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-dark-900 tracking-tight mb-3">
                        Security & Privacy
                    </h1>
                    <p className="text-base text-dark-500 max-w-md">
                        Here's exactly how we keep your data safe — spoiler: we never even see it.
                    </p>
                </div>

                <div className="space-y-6">
                    {SECURITY_POINTS.map((point) => (
                        <div
                            key={point.title}
                            className="bg-white border border-dark-200 rounded-2xl p-6 flex gap-5 items-start shadow-sm"
                        >
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                                <point.icon className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-dark-900 mb-1">{point.title}</h3>
                                <p className="text-sm text-dark-500 leading-relaxed">{point.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
