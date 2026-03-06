import { Settings, Sun, Moon, Trash2, Download } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import SEOHead from '../components/SEOHead'
import PageBackground from '../components/PageBackground'

export default function SettingsPage() {
    const { isDark, toggle } = useDarkMode()

    return (
        <div className="relative w-full flex flex-col items-center">
            <PageBackground />
            <SEOHead
                title="Settings — convertfiles.app"
                description="Configure your convertfiles.app preferences including dark mode, history, and default formats."
                canonical="https://convertfiles.app/settings"
            />
            <div className="w-full max-w-2xl mx-auto min-h-[calc(100vh-140px)] pt-16 pb-16 px-4">
                <div className="flex flex-col items-center text-center mb-12">
                    <div className="w-20 h-20 bg-dark-100 rounded-full flex items-center justify-center mb-6 ring-4 ring-dark-50">
                        <Settings className="w-10 h-10 text-dark-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-dark-900 tracking-tight mb-3">
                        Settings
                    </h1>
                    <p className="text-base text-dark-500 max-w-md">
                        Customize how convertfiles.app works for you.
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Theme Toggle */}
                    <div className="bg-white border border-dark-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            {isDark
                                ? <Sun className="w-6 h-6 text-amber-500" />
                                : <Moon className="w-6 h-6 text-indigo-500" />
                            }
                            <div>
                                <h3 className="text-base font-bold text-dark-900">Appearance</h3>
                                <p className="text-sm text-dark-500">Currently using {isDark ? 'dark' : 'light'} mode</p>
                            </div>
                        </div>
                        <button
                            onClick={toggle}
                            className="px-5 py-2 bg-dark-100 hover:bg-dark-200 text-dark-700 font-bold rounded-xl text-sm transition-colors"
                        >
                            Switch to {isDark ? 'Light' : 'Dark'}
                        </button>
                    </div>

                    {/* Export Data */}
                    <div className="bg-white border border-dark-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <Download className="w-6 h-6 text-blue-500" />
                            <div>
                                <h3 className="text-base font-bold text-dark-900">Export History</h3>
                                <p className="text-sm text-dark-500">Download your conversion history as JSON</p>
                            </div>
                        </div>
                        <button className="px-5 py-2 bg-dark-100 hover:bg-dark-200 text-dark-700 font-bold rounded-xl text-sm transition-colors">
                            Export
                        </button>
                    </div>

                    {/* Clear Data */}
                    <div className="bg-white border border-dark-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                            <div>
                                <h3 className="text-base font-bold text-dark-900">Clear All Data</h3>
                                <p className="text-sm text-dark-500">Delete conversion history and cached settings</p>
                            </div>
                        </div>
                        <button className="px-5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-colors">
                            Clear
                        </button>
                    </div>
                </div>

                <div className="mt-12 bg-white border border-dark-200 rounded-2xl p-8 text-center">
                    <p className="text-sm text-dark-400 font-medium">
                        More settings coming soon — default output formats, quality presets, and more.
                    </p>
                </div>
            </div>
        </div>
    )
}
