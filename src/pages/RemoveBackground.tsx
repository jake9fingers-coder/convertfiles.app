import { ImageOff } from 'lucide-react'

export default function RemoveBackground() {
    return (
        <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center text-center px-6 py-16">
            <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-100 rounded-xl mb-8">
                    <ImageOff className="w-10 h-10 text-brand-500" />
                </div>
                <h1 className="text-3xl font-bold text-dark-900 mb-3">Remove Background</h1>
                <p className="text-lg font-semibold text-brand-500 mb-4">Coming Soon</p>
                <p className="text-dark-500 leading-relaxed text-sm">
                    AI-powered background removal, running entirely in your browser. No uploads. No subscriptions.
                </p>
                <div className="mt-8 flex items-center justify-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-600">
                        🔒 Client-side only
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-100 border border-dark-200 text-xs font-semibold text-dark-600">
                        🚀 In development
                    </span>
                </div>
            </div>
        </div>
    )
}
