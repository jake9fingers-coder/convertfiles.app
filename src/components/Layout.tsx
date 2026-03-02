import { Outlet } from 'react-router-dom'
import Header from './Header'
import SmoothScroll from './SmoothScroll'

export default function Layout() {
    return (
        <div className="relative min-h-screen bg-dark-50 font-sans selection:bg-brand-300 selection:text-dark-900 flex flex-col">
            <SmoothScroll />
            <Header />

            <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto pt-14 md:pt-20">
                <Outlet />
            </main>
        </div>
    )
}
