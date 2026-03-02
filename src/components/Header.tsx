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
                ? 'bg-dark-900/95 backdrop-blur-md border-b border-dark-800 py-3'
                : 'bg-dark-900 py-4'
                }`}
        >
            <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="text-lg font-bold text-white tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src="/favicon.png" alt="Logo" className="w-5 h-5 object-contain" />
                    convertfiles.app
                </Link>

                <div className="hidden md:flex items-center gap-1 bg-dark-800 p-1 rounded-lg border border-dark-700">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-brand-500 text-dark-900 font-semibold'
                                : 'text-dark-300 hover:text-white'
                            }`
                        }
                    >
                        Video & Audio
                    </NavLink>
                    <NavLink
                        to="/image-converter"
                        className={({ isActive }) =>
                            `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-brand-500 text-dark-900 font-semibold'
                                : 'text-dark-300 hover:text-white'
                            }`
                        }
                    >
                        Image Converter
                    </NavLink>
                    <NavLink
                        to="/remove-background"
                        className={({ isActive }) =>
                            `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-brand-500 text-dark-900 font-semibold'
                                : 'text-dark-300 hover:text-white'
                            }`
                        }
                    >
                        Remove BG
                    </NavLink>
                </div>

                <div className="flex items-center">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
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
