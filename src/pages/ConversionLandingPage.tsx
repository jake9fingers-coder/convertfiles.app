import { useParams, Link } from 'react-router-dom'
import { SEO_CONVERSION_MAP, SITE_URL } from '../lib/seoConversionData'
import SEOHead from '../components/SEOHead'
import VideoConverter from './VideoConverter'
import ImageConverter from './ImageConverter'
import DataConverter from './DataConverter'
import ScrollReveal from '../components/ScrollReveal'
import Features from '../components/Features'
import { ArrowRight, ChevronDown, ChevronUp, Zap, Shield, Clock } from 'lucide-react'
import { useState } from 'react'

export default function ConversionLandingPage() {
    const { slug } = useParams<{ slug: string }>()
    const data = slug ? SEO_CONVERSION_MAP[slug] : undefined

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

            {/* Full viewport top section */}
            <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center pt-20 pb-10">
                {/* Converter Section */}
                <section className="px-6 relative z-20">
                    <div className="max-w-5xl mx-auto">
                        {data.converterType === 'video' && <VideoConverter embedded />}
                        {data.converterType === 'image' && <ImageConverter embedded />}
                        {data.converterType === 'data' && <DataConverter embedded />}
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
