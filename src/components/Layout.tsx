import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import SmoothScroll from './SmoothScroll'

export default function Layout() {
    return (
        <div className="relative min-h-screen bg-dark-50 font-sans selection:bg-brand-500 selection:text-white flex flex-col">
            <SmoothScroll />
            <Header />

            {/* Main content - flex-1 pushes footer to the bottom */}
            <main className="flex-1 flex flex-col w-full pt-14 md:pt-20">
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}
