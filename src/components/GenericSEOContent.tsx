import { Zap, Shield, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

interface SEOContentConfig {
    h1: string
    intro: string
    whyTitle: string
    points: { label: string; text: React.ReactNode }[]
}

const TOOL_CONTENT: Record<string, SEOContentConfig> = {
    video: {
        h1: 'Free Online Video & Audio Converter',
        intro: 'Convert video and audio files instantly in your browser. MP4, MOV, WebM, GIF, MP3 - our free mp4 converter handles every format without uploading your files to any server. No limits, no watermarks, no sign-up.',
        whyTitle: 'Why use our video converter?',
        points: [
            { label: 'Any Format, Any Direction', text: <>From <Link to="/convert/mp4-to-gif" className="text-brand-600 hover:underline font-medium">MP4 to GIF</Link>, <Link to="/convert/mov-to-mp4" className="text-brand-600 hover:underline font-medium">MOV to MP4</Link>, to <Link to="/convert/mp4-to-mp3" className="text-brand-600 hover:underline font-medium">extracting MP3 audio</Link> - our <strong>mp4 converter</strong> and <strong>gif converter</strong> support every common video and audio format. Perfect for Discord, social media, and presentations.</> },
            { label: 'Browser-Powered', text: 'Traditional video converters require huge desktop installs or risky server uploads. Ours runs entirely in your browser tab using advanced processing. Your videos never leave your device.' },
            { label: 'Completely Free', text: 'No hidden fees, no "premium" tiers, and no artificial restrictions on file size or number of conversions per day.' },
        ],
    },
    image: {
        h1: 'Free Online Image Converter - JPG, PNG, WebP, HEIC & More',
        intro: 'Convert images between any format instantly and for free. Whether you need a reliable jpg converter, a quick HEIC to JPG tool, or a WebP to PNG converter, everything runs privately in your browser. No uploads, no quality loss.',
        whyTitle: 'Why use our image converter?',
        points: [
            { label: 'iPhone Ready', text: <>The #1 use case: <Link to="/convert/heic-to-jpg" className="text-brand-600 hover:underline font-medium">convert HEIC to JPG</Link>. If you've ever tried to share an iPhone photo and got told "unsupported format," this is your fix. Our <strong>online heic to jpg converter</strong> preserves full quality with zero hassle.</> },
            { label: 'Every Format Covered', text: <>JPG, PNG, WebP, HEIC, BMP, TIFF, AVIF - convert between any combination. Need to <Link to="/convert/webp-to-png" className="text-brand-600 hover:underline font-medium">convert WebP to PNG</Link> or <Link to="/convert/png-to-jpg" className="text-brand-600 hover:underline font-medium">PNG to JPG</Link>? Done in seconds.</> },
            { label: '100% Private', text: 'Your images are processed locally in your browser memory. Nothing is ever uploaded to a server. This is the most private way to convert images online.' },
        ],
    },
    data: {
        h1: 'Free Online Data Converter - JSON, CSV & Excel',
        intro: 'Transform data files between JSON, CSV, and Excel (XLSX) formats instantly. Perfect for developers, data analysts, and anyone working with structured data. Everything processes in your browser - your data stays private.',
        whyTitle: 'Why use our data converter?',
        points: [
            { label: 'Developer Friendly', text: <>Instantly convert <Link to="/convert/json-to-csv" className="text-brand-600 hover:underline font-medium">JSON to CSV</Link>, <Link to="/convert/csv-to-json" className="text-brand-600 hover:underline font-medium">CSV to JSON</Link>, or <Link to="/convert/json-to-excel" className="text-brand-600 hover:underline font-medium">JSON to Excel</Link>. Handles nested objects, arrays, and complex data structures intelligently.</> },
            { label: 'Confidential Data Safe', text: 'Since everything runs in your browser, sensitive business data, API responses, and database exports never touch a third-party server. No tracking, no logging.' },
            { label: 'No Software Needed', text: 'Skip installing Python scripts or npm packages. Just drag your file, pick an output format, and download. Works on any device with a browser.' },
        ],
    },
    units: {
        h1: 'Free Unit Converter - Length, Mass, Volume & More',
        intro: 'Instantly convert between units of length, mass, volume, temperature, and digital data. Precision-engineered formulas run entirely offline in your browser. No API calls, no tracking - just fast, accurate results.',
        whyTitle: 'Why use our unit converter?',
        points: [
            { label: 'Pinpoint Accuracy', text: 'Our converter uses mathematically precise conversion formulas, not rounded lookup tables. Get results you can trust for engineering, science, and everyday calculations.' },
            { label: 'Works Offline', text: 'Once the page loads, the unit converter works without any internet connection. Perfect for fieldwork, travel, or anywhere you need quick conversions on the go.' },
            { label: 'All Categories', text: 'Length (km, miles, feet), mass (kg, lbs, oz), volume (liters, gallons, cups), temperature (°C, °F, K), and digital data (bytes to terabytes) - all in one place.' },
        ],
    },
    currency: {
        h1: 'Free Currency Converter - Live Exchange Rates',
        intro: 'Convert between 50+ world currencies and cryptocurrencies with live mid-market exchange rates. View historical trends and make informed decisions - all for free, no sign-up required.',
        whyTitle: 'Why use our currency converter?',
        points: [
            { label: 'Live Rates', text: 'Our exchange rates are fetched from reliable market data sources and updated regularly. See the exact mid-market rate before you convert - no hidden markups.' },
            { label: 'Crypto Included', text: 'Convert between traditional currencies (USD, EUR, GBP) and cryptocurrencies (Bitcoin, Ethereum) plus precious metals (Gold, Silver) all in one tool.' },
            { label: 'Historical Trends', text: 'View 7-day, 30-day, 90-day, and 1-year trend charts to understand how exchange rates have moved over time. Essential for timing international transfers.' },
        ],
    },
    document: {
        h1: 'Free Document Converter - PDF to JPG & Images to PDF',
        intro: 'Convert PDF files to high-quality images or merge multiple images into a single PDF document instantly. Everything processes securely inside your browser.',
        whyTitle: 'Why use our document converter?',
        points: [
            { label: 'Merge Images to PDF', text: 'Easily combine multiple PNG or JPG images into a single, organized PDF file without losing any quality.' },
            { label: 'Extract PDF Pages', text: 'Convert every page of your PDF into high-quality JPG images instantly.' },
            { label: 'Client-side Privacy', text: 'Unlike other converters, your sensitive documents are never uploaded to our servers. All conversion happens locally.' },
        ],
    },
}

// Fallback for any tool not explicitly configured
const DEFAULT_CONTENT: SEOContentConfig = TOOL_CONTENT.video

export default function GenericSEOContent({ toolId = 'video' }: { toolId?: string }) {
    const content = TOOL_CONTENT[toolId] || DEFAULT_CONTENT

    return (
        <section className="py-16 px-6 relative z-10 bg-gradient-to-b from-dark-50/50 to-white border-t border-dark-100">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-dark-900 tracking-tight mb-4 leading-tight">
                    {content.h1}
                </h1>

                <p className="text-base md:text-lg text-dark-500 max-w-2xl mx-auto leading-relaxed mb-8">
                    {content.intro}
                </p>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-dark-200 shadow-sm text-sm font-medium text-dark-700">
                        <Zap className="w-4 h-4 text-brand-500" />
                        Instant Conversion
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-dark-200 shadow-sm text-sm font-medium text-dark-700">
                        <Shield className="w-4 h-4 text-brand-500" />
                        100% Private
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-dark-200 shadow-sm text-sm font-medium text-dark-700">
                        <Clock className="w-4 h-4 text-brand-500" />
                        No File Size Limits
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 md:p-8 border border-dark-200 shadow-sm text-left max-w-3xl mx-auto">
                    <h2 className="text-xl font-bold text-dark-900 mb-4">{content.whyTitle}</h2>
                    <div className="space-y-3 text-sm text-dark-600 leading-relaxed">
                        {content.points.map((point, i) => (
                            <p key={i}>
                                <strong className="text-dark-800">{point.label}:</strong> {point.text}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
