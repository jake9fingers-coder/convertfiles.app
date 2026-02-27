import ScrollReveal from './ScrollReveal'
import { Shield, Zap, Globe, Lock, Cpu, Infinity as InfinityIcon } from 'lucide-react'

const features = [
    {
        icon: <Lock className="w-5 h-5 text-indigo-600" />,
        title: 'Zero Upload, Zero Risk',
        description: 'Your files are never sent to any server. Everything runs locally in your browser tab using WebAssembly.',
    },
    {
        icon: <InfinityIcon className="w-5 h-5 text-indigo-600" />,
        title: 'No File Size Limits',
        description: 'Because we process locally, there are no arbitrary limits. Convert a 4GB movie file if you want.',
    },
    {
        icon: <Zap className="w-5 h-5 text-indigo-600" />,
        title: 'Powered by FFmpeg',
        description: "The world's most trusted media tool, compiled to WebAssembly. The same engine behind VLC, YouTube and more.",
    },
    {
        icon: <Shield className="w-5 h-5 text-indigo-600" />,
        title: 'No Account Required',
        description: 'No sign-up, no email, no tracking. Open the page, drop a file, get your output.',
    },
    {
        icon: <Globe className="w-5 h-5 text-indigo-600" />,
        title: 'Works Offline',
        description: 'Once the FFmpeg engine loads, you can even disconnect from the internet. It still works.',
    },
    {
        icon: <Cpu className="w-5 h-5 text-indigo-600" />,
        title: 'Multi-Thread Acceleration',
        description: 'When your browser supports it, we automatically enable multi-threaded FFmpeg for maximum speed.',
    },
]

export default function Features() {
    return (
        <section id="features" className="py-24 px-6">
            <div className="max-w-5xl mx-auto">
                <ScrollReveal className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                        Built different
                    </h2>
                    <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                        Every other converter uploads your files to their servers. We don't.
                    </p>
                </ScrollReveal>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f, i) => (
                        <ScrollReveal key={f.title} delay={i * 0.08}>
                            <div className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-sm transition-all duration-200">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                                    {f.icon}
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
