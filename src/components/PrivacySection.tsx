import ScrollReveal from './ScrollReveal'

export default function PrivacySection() {
    return (
        <section id="privacy" className="py-20 px-6 bg-gray-900">
            <div className="max-w-4xl mx-auto">
                <ScrollReveal className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-2xl mb-8">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
                        Your files stay on your device.
                        <span className="block text-emerald-400 mt-2">Always.</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
                        convertfiles.app processes everything using <strong className="text-white">WebAssembly</strong> — a technology that lets us run FFmpeg directly inside your browser tab. There is no server receiving your files. Nothing is stored. Nothing is logged. You can verify this yourself by opening DevTools → Network while converting.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4 text-left">
                        {[
                            { icon: '🚫', title: 'No uploads', desc: 'Files never touch our (non-existent) servers.' },
                            { icon: '🕵️', title: 'No tracking', desc: 'No analytics, no fingerprinting, no ad pixels.' },
                            { icon: '💾', title: 'No storage', desc: 'Files vanish when you close the tab.' },
                        ].map(item => (
                            <div key={item.title} className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                <span className="text-2xl block mb-3">{item.icon}</span>
                                <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
