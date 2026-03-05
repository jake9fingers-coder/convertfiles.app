import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X, Sun, Moon } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'

const MAIN_LINKS = [
    { to: '/', label: 'Video & Audio' },
    { to: '/image-converter', label: 'Images' },
    { to: '/data-converter', label: 'Data' },
    { to: '/units', label: 'Units' },
]

const MORE_LINKS = [
    { to: '/currency-converter', label: 'Currency Converter' },
]

export default function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [moreOpen, setMoreOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const moreRef = useRef<HTMLDivElement>(null)
    const location = useLocation()
    const { isDark, toggle } = useDarkMode()

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [location.pathname])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
                setMoreOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `whitespace-nowrap px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-brand-500 text-white font-semibold shadow-sm'
            : 'text-dark-600 hover:text-dark-900 hover:bg-dark-100'
        }`

    return (
        <nav
            className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrolled
                ? 'bg-dark-50/90 backdrop-blur-md border-b border-dark-200 py-3'
                : 'bg-dark-50/50 py-4'
                }`}
        >
            <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="text-lg font-bold text-dark-900 tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src="/favicon.svg" alt="Logo" className="w-5 h-5 object-contain" />
                    convertfiles.app
                </Link>

                <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-lg border border-dark-200 shadow-sm">
                    {MAIN_LINKS.map(link => (
                        <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
                            {link.label}
                        </NavLink>
                    ))}

                    {/* More dropdown */}
                    <div className="relative" ref={moreRef}>
                        <button
                            onClick={() => setMoreOpen(prev => !prev)}
                            className={`flex items-center gap-1 whitespace-nowrap px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 text-dark-600 hover:text-dark-900 hover:bg-dark-100 ${moreOpen ? 'bg-dark-100 text-dark-900' : ''}`}
                        >
                            More
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {moreOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white border border-dark-200 rounded-xl shadow-lg py-1.5 z-50 animate-slide-up">
                                {MORE_LINKS.map(link => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMoreOpen(false)}
                                        className={({ isActive }) =>
                                            `block px-4 py-2.5 text-sm font-medium transition-colors ${isActive
                                                ? 'bg-brand-50 text-brand-600 font-semibold'
                                                : 'text-dark-700 hover:bg-dark-50 hover:text-dark-900'
                                            }`
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-soft-100 border border-soft-300 text-xs font-semibold text-brand-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        100% Private
                    </span>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggle}
                        className="p-1.5 text-dark-500 hover:text-dark-900 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun className="w-5 h-5 text-brand-500" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 -mr-2 text-dark-600 hover:text-dark-900 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-dark-200 bg-white shadow-xl absolute w-full left-0 top-full">
                    <div className="flex flex-col px-4 pt-2 pb-4 space-y-1">
                        {MAIN_LINKS.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.to === '/'}
                                className={({ isActive }) =>
                                    `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                                        ? 'bg-brand-50 text-brand-600'
                                        : 'text-dark-700 hover:bg-dark-50 hover:text-dark-900'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}

                        <div className="pt-2 pb-1">
                            <p className="px-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                                More Tools
                            </p>
                        </div>

                        {MORE_LINKS.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                                        ? 'bg-brand-50 text-brand-600'
                                        : 'text-dark-700 hover:bg-dark-50 hover:text-dark-900'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}
