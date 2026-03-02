import ScrollReveal from './ScrollReveal'
import { Shield, Zap, Lock, Infinity as InfinityIcon, Upload, Sliders, Download } from 'lucide-react'

const features = [
    {
        icon: <Lock className="w-7 h-7 text-brand-400" />,
        title: 'Zero Upload, Zero Risk',
        description: 'Files are never sent to any server. Everything runs locally.',
    },
    {
        icon: <InfinityIcon className="w-7 h-7 text-brand-300" />,
        title: 'No Size Limits',
        description: 'No arbitrary limits. Convert a 4GB movie file if you want.',
    },
    {
        icon: <Zap className="w-7 h-7 text-brand-500" />,
        title: 'Instant Conversion',
        description: 'Powered by WebAssembly. The same engine behind VLC and YouTube.',
    },
    {
        icon: <Shield className="w-7 h-7 text-emerald-400" />,
        title: 'No Account Required',
        description: 'No sign-up. Open the page, drop a file, get your output.',
    }
]

const steps = [
    {
        icon: <Upload className="w-6 h-6 text-brand-400" />,
        number: '01',
        title: 'Drop your file',
        description: 'Drag and drop any video, audio, or image file.',
    },
    {
        icon: <Sliders className="w-6 h-6 text-brand-300" />,
        number: '02',
        title: 'Choose output',
        description: 'Pick your format, adjust quality, or extract audio.',
    },
    {
        icon: <Download className="w-6 h-6 text-brand-500" />,
        number: '03',
        title: 'Download instantly',
        description: 'Everything processes directly in your browser.',
    },
]

export default function Features() {
    return (
        <section id="features" className="py-24 px-6 relative overflow-hidden bg-dark-50">
            <div className="max-w-5xl mx-auto relative z-10">
                <ScrollReveal className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-dark-900 tracking-tight mb-6">
                        Everything you need.<br /> Nothing you don't.
                    </h2>
                    <p className="text-xl text-dark-500 max-w-2xl mx-auto leading-relaxed">
                        Three steps. No servers. No limits. Just instant, private file conversion directly in your browser.
                    </p>
                </ScrollReveal>

                {/* How it Works Row */}
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    {steps.map((step, i) => (
                        <ScrollReveal key={step.number} delay={i * 0.12}>
                            <div className="bg-dark-900 rounded-xl p-8 relative group overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                                <div className="absolute -right-4 -top-4 text-9xl font-black text-dark-800 pointer-events-none select-none">
                                    {step.number}
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-dark-800 rounded-lg flex items-center justify-center mb-5 border border-dark-700">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-dark-300 leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                {/* Features Row */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((f, i) => (
                        <ScrollReveal key={f.title} delay={i * 0.1}>
                            <div className="p-6 rounded-xl bg-dark-900 group h-full flex flex-col items-center text-center hover:scale-[1.02] transition-transform duration-300">
                                <div className="w-14 h-14 bg-dark-800 rounded-lg flex items-center justify-center mb-5 border border-dark-700">
                                    {f.icon}
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-sm text-dark-300 leading-relaxed">{f.description}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
