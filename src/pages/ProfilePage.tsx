import { User, LogIn, LogOut } from 'lucide-react'
import SEOHead from '../components/SEOHead'

export default function ProfilePage() {
    return (
        <div className="w-full flex flex-col items-center">
            <SEOHead
                title="Profile — convertfiles.app"
                description="Manage your profile, sign in, or sign out of convertfiles.app."
                canonical="https://convertfiles.app/profile"
            />
            <div className="w-full max-w-2xl mx-auto min-h-[calc(100vh-140px)] pt-16 pb-16 px-4">
                <div className="flex flex-col items-center text-center mb-12">
                    <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-brand-100">
                        <User className="w-10 h-10 text-brand-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-dark-900 tracking-tight mb-3">
                        Your Profile
                    </h1>
                    <p className="text-base text-dark-500 max-w-md">
                        Sign in to sync your conversion history across devices and unlock saved preferences.
                    </p>
                </div>

                <div className="space-y-4 max-w-sm mx-auto">
                    <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm shadow-brand-500/20 transition-all hover:shadow-brand-500/30 transform hover:-translate-y-0.5">
                        <LogIn className="w-5 h-5" />
                        Sign In
                    </button>
                    <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-dark-100 hover:bg-dark-200 text-dark-700 font-bold rounded-xl transition-colors">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>

                <div className="mt-16 bg-white border border-dark-200 rounded-2xl p-8 text-center">
                    <p className="text-sm text-dark-400 font-medium">
                        Account features coming soon — stay tuned!
                    </p>
                </div>
            </div>
        </div>
    )
}
