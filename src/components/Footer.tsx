import { Github } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="w-full py-12 px-6 border-t border-gray-100 bg-white mt-auto">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center md:items-start gap-1">
                    <div className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="text-indigo-500">⚡</span> Convertly
                    </div>
                    <p className="text-sm text-gray-400">
                        100% private, client-side media conversion.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <a
                        href="#"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Privacy Policy
                    </a>
                    <a
                        href="https://github.com/jake9fingers-coder"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 -m-2 text-gray-400 hover:text-gray-900 transition-colors"
                        aria-label="GitHub Repository"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </footer>
    )
}
