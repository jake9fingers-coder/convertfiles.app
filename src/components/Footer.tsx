import { Link } from 'react-router-dom'
import { SEO_CONVERSION_MAP, TOP_CONVERSIONS } from '../lib/seoConversionData'

export default function Footer() {
    const topConversionData = TOP_CONVERSIONS
        .map(slug => SEO_CONVERSION_MAP[slug])
        .filter(Boolean)

    return (
        <footer className="w-full pt-16 pb-8 border-t border-dark-200 bg-white mt-auto">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <Link to="/" className="text-xl font-bold text-dark-900 flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                            <img src="/favicon.svg" alt="convertfiles.app logo" className="w-6 h-6 object-contain" />
                            convertfiles.app
                        </Link>
                        <p className="text-sm text-dark-500 leading-relaxed mb-6">
                            The ultimate free online file converter. 100% private, instantaneous conversions powered directly by your browser. No strings attached.
                        </p>
                    </div>

                    {/* Popular Conversions Grid */}
                    <div className="md:col-span-2">
                        <h3 className="text-xs font-bold text-dark-900 uppercase tracking-widest mb-6">Popular Conversions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                            {topConversionData.map(conv => (
                                <Link
                                    key={conv.slug}
                                    to={`/convert/${conv.slug}`}
                                    className="text-sm font-medium text-dark-500 hover:text-brand-600 transition-colors w-fit"
                                >
                                    {conv.sourceFormat} to {conv.targetFormat}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* All Converters */}
                    <div className="md:col-span-1">
                        <h3 className="text-xs font-bold text-dark-900 uppercase tracking-widest mb-6">All Tools</h3>
                        <div className="flex flex-col gap-3">
                            <Link to="/" className="text-sm font-medium text-dark-500 hover:text-brand-600 transition-colors w-fit">
                                Video & Audio Converter
                            </Link>
                            <Link to="/image-converter" className="text-sm font-medium text-dark-500 hover:text-brand-600 transition-colors w-fit">
                                Image Converter
                            </Link>
                            <Link to="/data-converter" className="text-sm font-medium text-dark-500 hover:text-brand-600 transition-colors w-fit">
                                Data Converter
                            </Link>
                            <Link to="/units" className="text-sm font-medium text-dark-500 hover:text-brand-600 transition-colors w-fit">
                                Unit Converter
                            </Link>
                            <Link to="/currency-converter" className="text-sm font-medium text-dark-500 hover:text-brand-600 transition-colors w-fit">
                                Currency Converter
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-dark-100">
                    <p className="text-sm text-dark-400 font-medium">
                        © {new Date().getFullYear()} convertfiles.app. All rights reserved.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-sm font-medium text-dark-500 hover:text-dark-900 transition-colors">About Us</a>
                            <a href="#" className="text-sm font-medium text-dark-500 hover:text-dark-900 transition-colors">Contact</a>
                        </div>
                        <div className="hidden sm:block w-px h-4 bg-dark-200"></div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-sm font-medium text-dark-500 hover:text-dark-900 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-sm font-medium text-dark-500 hover:text-dark-900 transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
