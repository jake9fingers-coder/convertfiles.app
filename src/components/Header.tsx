import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'

export default function Header() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav
            className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrolled
                ? 'bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm py-3'
                : 'bg-transparent py-4'
                }`}
        >
            <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="text-indigo-500">⚡</span>
                    Convertly
                </Link>

                <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                            }`
                        }
                    >
                        Video & Audio
                    </NavLink>
                    <NavLink
                        to="/image-converter"
                        className={({ isActive }) =>
                            `px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                            }`
                        }
                    >
                        Image Converter
                    </NavLink>
                    <NavLink
                        to="/remove-background"
                        className={({ isActive }) =>
                            `px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                            }`
                        }
                    >
                        Remove BG
                    </NavLink>
                </div>

                <div className="flex items-center">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        100% Private
                    </span>
                </div>
            </div>
        </nav>
    )
}
