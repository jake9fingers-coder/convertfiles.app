import ScrollReveal from './ScrollReveal'
import { Upload, Sliders, Download } from 'lucide-react'

export default function HowItWorks() {
    const steps = [
        {
            icon: <Upload className="w-6 h-6 text-brand-500" />,
            number: '01',
            title: 'Drop your file',
            description: 'Drag and drop any video or audio file. Any size — there are no upload limits because nothing ever leaves your device.',
        },
        {
            icon: <Sliders className="w-6 h-6 text-brand-500" />,
            number: '02',
            title: 'Choose your output',
            description: 'Pick a format: animated GIF, compressed MP4, WebM, or extract the audio track. Tune quality to your needs.',
        },
        {
            icon: <Download className="w-6 h-6 text-brand-500" />,
            number: '03',
            title: 'Download instantly',
            description: 'The engine runs directly within your browser. Hit convert, watch the progress, and download your file.',
        },
    ]

    return (
        <section id="how-it-works" className="py-24 px-6 bg-white border-y border-dark-200">
            <div className="max-w-5xl mx-auto">
                <ScrollReveal className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-dark-900 tracking-tight mb-4">
                        How it works
                    </h2>
                    <p className="text-lg text-dark-500 max-w-xl mx-auto leading-relaxed">
                        Three steps. No account. No waiting. No ads.
                    </p>
                </ScrollReveal>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <ScrollReveal key={step.number} delay={i * 0.12}>
                            <div className="bg-white rounded-xl p-7 border border-dark-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                                        {step.icon}
                                    </div>
                                    <span className="text-3xl font-bold text-dark-200 select-none">{step.number}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-dark-900 mb-2">{step.title}</h3>
                                <p className="text-sm text-dark-500 leading-relaxed">{step.description}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
