import { useParams, Link } from 'react-router-dom'
import { SEO_CONVERSION_MAP, SITE_URL } from '../lib/seoConversionData'
import SEOHead from '../components/SEOHead'
import VideoConverter from './VideoConverter'
import ImageConverter from './ImageConverter'
import DataConverter from './DataConverter'
import CurrencyConverter from './CurrencyConverter'
import UnitConverter from './UnitConverter'
import ScrollReveal from '../components/ScrollReveal'
import Features from '../components/Features'
import { ArrowRight, ChevronDown, ChevronUp, Zap, Shield, Clock } from 'lucide-react'
import { useState } from 'react'
import { TextRoll } from '@/components/ui/text-roll'

export default function ConversionLandingPage() {
    const { slug } = useParams<{ slug: string }>()
    const data = slug ? SEO_CONVERSION_MAP[slug] : undefined
    const [heroKey, setHeroKey] = useState(0)

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-dark-900 mb-4">Conversion Not Found</h1>
                    <p className="text-dark-500 mb-6">The conversion you're looking for doesn't exist.</p>
                    <Link to="/" className="text-brand-500 hover:text-brand-600 font-medium">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    const canonicalUrl = `${SITE_URL}/convert/${data.slug}`
    const breadcrumbs = [
        { name: 'Home', url: SITE_URL },
        { name: `${data.sourceFormat} to ${data.targetFormat}`, url: canonicalUrl },
    ]

    // HowTo structured data
    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to Convert ${data.sourceFormat} to ${data.targetFormat}`,
        description: data.description,
        step: [
            {
                '@type': 'HowToStep',
                name: `Upload your ${data.sourceFormat} file`,
                text: `Drag and drop your ${data.sourceFormat} file onto the converter, or click to browse and select your file.`,
            },
            {
                '@type': 'HowToStep',
                name: `Select ${data.targetFormat} as output format`,
                text: `The converter will automatically be set to ${data.targetFormat} output format. Adjust quality settings if needed.`,
            },
            {
                '@type': 'HowToStep',
                name: 'Download your converted file',
                text: `Click convert and download your ${data.targetFormat} file instantly. Everything processes in your browser.`,
            },
        ],
        tool: {
            '@type': 'HowToTool',
            name: 'convertfiles.app',
        },
        totalTime: 'PT1M',
    }

    return (
        <div className="min-h-screen">
            <SEOHead
                title={data.title}
                description={data.description}
                canonical={canonicalUrl}
                keywords={data.keywords}
                faqItems={data.faqItems}
                breadcrumbs={breadcrumbs}
                structuredData={howToSchema}
            />

            <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center pt-20 pb-10">
                {/* Header above converter */}
                <div className="w-full mb-8 flex flex-col items-center text-center px-4">
                    <div className="inline-flex items-center justify-center mb-4">
                        <img src="/favicon.svg" alt="Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <div
                        className="text-4xl md:text-5xl font-bold text-dark-900 tracking-tight mb-2 cursor-pointer"
                        onMouseEnter={() => setHeroKey(k => k + 1)}
                    >
                        <TextRoll key={heroKey}>
                            convertfiles.app
                        </TextRoll>
                    </div>
                    <p className="text-xl font-semibold text-brand-500 mb-2">
                        {data.sourceFormat} to {data.targetFormat} Converter
                    </p>
                    <p className="text-base text-dark-500 max-w-sm">
                        Free, instant, private — runs entirely in your browser
                    </p>
                </div>

                {/* Converter Section */}
                <section className="px-6 relative z-20">
                    <div className="max-w-5xl mx-auto">
                        {(() => {
                            const isUnitOrCurrency = data.converterType === 'currency' || data.converterType === 'unit'
                            const initialFrom = isUnitOrCurrency ? data.converterMode.split('_to_')[0] : undefined
                            const initialTo = isUnitOrCurrency ? data.converterMode.split('_to_')[1] : undefined

                            return (
                                <>
                                    {data.converterType === 'video' && <VideoConverter embedded />}
                                    {data.converterType === 'image' && <ImageConverter embedded />}
                                    {data.converterType === 'data' && <DataConverter embedded />}
                                    {data.converterType === 'currency' && <CurrencyConverter embedded initialFrom={initialFrom} initialTo={initialTo} />}
                                    {data.converterType === 'unit' && <UnitConverter embedded initialCategory="all" initialFrom={initialFrom} initialTo={initialTo} />}
                                </>
                            )
                        })()}
                    </div>
                </section>

                {/* Related Conversions (still in top viewport) */}
                {data.relatedConversions.length > 0 && (
                    <section className="pt-16 md:pt-24 px-6 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-xl font-bold text-dark-900 mb-6 text-center">
                                Related Conversions
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {data.relatedConversions
                                    .filter(slug => SEO_CONVERSION_MAP[slug])
                                    .map(relSlug => {
                                        const rel = SEO_CONVERSION_MAP[relSlug]
                                        return (
                                            <Link
                                                key={relSlug}
                                                to={`/convert/${relSlug}`}
                                                className="group flex items-center gap-3 p-4 bg-white border border-dark-200 rounded-xl shadow-sm hover:border-brand-400 hover:shadow-md transition-all duration-200"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-dark-900 group-hover:text-brand-600 transition-colors">
                                                        {rel.sourceFormat} → {rel.targetFormat}
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-dark-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                                            </Link>
                                        )
                                    })}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* SEO Content Section (Hero) - Now naturally pushed below the fold */}
            <section className="py-20 px-6 relative z-10 bg-gradient-to-b from-dark-50/50 to-white">
                <div className="max-w-4xl mx-auto text-center border-t border-dark-200 pt-16">
                    {/* Breadcrumb */}
                    <nav className="flex items-center justify-center gap-2 text-sm text-dark-400 mb-6" aria-label="Breadcrumb">
                        <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-dark-600 font-medium">{data.sourceFormat} to {data.targetFormat}</span>
                    </nav>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900 tracking-tight mb-6 leading-tight">
                        {data.h1}
                    </h1>

                    <p className="text-lg md:text-xl text-dark-500 max-w-3xl mx-auto leading-relaxed mb-10">
                        {data.intro}
                    </p>

                    {/* Trust badges */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-dark-200 shadow-sm text-sm font-medium text-dark-700">
                            <Zap className="w-4 h-4 text-brand-500" />
                            Instant Conversion
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-dark-200 shadow-sm text-sm font-medium text-dark-700">
                            <Shield className="w-4 h-4 text-brand-500" />
                            100% Private
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-dark-200 shadow-sm text-sm font-medium text-dark-700">
                            <Clock className="w-4 h-4 text-brand-500" />
                            No Sign-up
                        </div>
                    </div>
                </div>
            </section>

            {/* Fun Facts / Unique Stats Section (for SEO uniqueness) */}
            {data.funFacts && data.funFacts.length > 0 && (
                <section className="py-16 px-6 bg-white border-b border-dark-100">
                    <div className="max-w-5xl mx-auto">
                        <ScrollReveal>
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-dark-900 mb-4">
                                    Did You Know?
                                </h2>
                                <p className="text-lg text-dark-500 max-w-2xl mx-auto">
                                    Interesting facts about {data.sourceFormat} and {data.targetFormat}.
                                </p>
                            </div>
                        </ScrollReveal>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {data.funFacts.map((fact, i) => (
                                <ScrollReveal key={i} delay={i * 100}>
                                    <div className="h-full bg-dark-50 rounded-2xl p-6 border border-dark-100 hover:border-brand-200 hover:shadow-sm transition-all">
                                        <h3 className="text-lg font-bold text-dark-900 mb-3 flex items-center gap-2">
                                            <span className="text-brand-500 text-xl leading-none">•</span>
                                            {fact.title}
                                        </h3>
                                        <p className="text-dark-600 leading-relaxed text-sm">
                                            {fact.content}
                                        </p>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ Section */}
            {data.faqItems.length > 0 && (
                <section className="py-16 px-6 bg-dark-50">
                    <div className="max-w-3xl mx-auto">
                        <ScrollReveal>
                            <h2 className="text-3xl font-bold text-dark-900 mb-8 text-center">
                                Frequently Asked Questions
                            </h2>
                        </ScrollReveal>

                        <div className="space-y-3">
                            {data.faqItems.map((faq, i) => (
                                <FAQAccordion key={i} question={faq.question} answer={faq.answer} defaultOpen={i === 0} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features */}
            <Features />
        </div>
    )
}

/** Accessible FAQ accordion item */
function FAQAccordion({ question, answer, defaultOpen = false }: { question: string; answer: string; defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="bg-white border border-dark-200 rounded-xl overflow-hidden shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-dark-50 transition-colors"
                aria-expanded={isOpen}
            >
                <h3 className="text-base font-semibold text-dark-900 pr-4">{question}</h3>
                {isOpen
                    ? <ChevronUp className="w-5 h-5 text-dark-400 flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-dark-400 flex-shrink-0" />
                }
            </button>
            {isOpen && (
                <div className="px-5 pb-5 pt-0">
                    <p className="text-dark-600 leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    )
}
