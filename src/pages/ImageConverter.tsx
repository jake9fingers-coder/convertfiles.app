import { ImageIcon } from 'lucide-react'

export default function ImageConverter() {
    return (
        <div className="w-full max-w-xl mx-auto space-y-6 text-center animate-slide-up">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-blue-500" />
                </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Image Converter
            </h1>
            <p className="text-lg text-gray-500 max-w-md mx-auto">
                Convert WebP, HEIC, PNG, and JPEG files instantly.
            </p>

            <div className="mt-8 p-12 bg-white border border-gray-100 border-dashed rounded-3xl shadow-sm flex flex-col items-center justify-center">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Coming Soon</span>
                <p className="text-gray-600">This feature is currently under development.</p>
            </div>
        </div>
    )
}
