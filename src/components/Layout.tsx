import { Outlet } from 'react-router-dom'
import Header from './Header'
import SmoothScroll from './SmoothScroll'

export default function Layout() {
    return (
        <div className="relative min-h-screen bg-gray-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
            <SmoothScroll />
            <Header />

            <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto pt-14 md:pt-20">
                {/* Router Outlet for page content */}
                <Outlet />
            </main>
        </div>
    )
}
