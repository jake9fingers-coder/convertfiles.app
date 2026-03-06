import { useState } from 'react'
import { User, LogIn, LogOut, UserPlus, ArrowLeft } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import { AssistedPasswordConfirmation } from '../components/ui/assisted-password-confirmation'

export default function ProfilePage() {
    const [view, setView] = useState<'default' | 'signin' | 'signup'>('default')
    const [password, setPassword] = useState('')

    return (
        <div className="w-full flex flex-col items-center">
            <SEOHead
                title="Profile — convertfiles.app"
                description="Manage your profile, sign in, or sign out of convertfiles.app."
                canonical="https://convertfiles.app/profile"
            />
            <div className="w-full max-w-2xl mx-auto min-h-[calc(100vh-140px)] pt-16 pb-16 px-4">

                {view !== 'default' && (
                    <button
                        onClick={() => setView('default')}
                        className="flex items-center gap-2 text-dark-500 hover:text-dark-900 mb-8 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                )}

                <div className="flex flex-col items-center text-center mb-12">
                    <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-brand-100">
                        <User className="w-10 h-10 text-brand-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-dark-900 tracking-tight mb-3">
                        {view === 'default' && "Your Profile"}
                        {view === 'signin' && "Sign In"}
                        {view === 'signup' && "Create an Account"}
                    </h1>
                    <p className="text-base text-dark-500 max-w-md">
                        {view === 'default' && "Sign in or create an account to sync your conversion history across devices and unlock saved preferences."}
                        {view === 'signin' && "Welcome back! Enter your details to access your account."}
                        {view === 'signup' && "Set up a new account to unlock sync and preferences."}
                    </p>
                </div>

                {view === 'default' && (
                    <div className="space-y-4 max-w-sm mx-auto">
                        <button
                            onClick={() => setView('signin')}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm shadow-brand-500/20 transition-all hover:shadow-brand-500/30 transform hover:-translate-y-0.5"
                        >
                            <LogIn className="w-5 h-5" />
                            Sign In
                        </button>
                        <button
                            onClick={() => setView('signup')}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-brand-500 hover:bg-brand-50 text-brand-600 font-bold rounded-xl transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            Create Account
                        </button>
                        <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-dark-100 hover:bg-dark-200 text-dark-700 font-bold rounded-xl transition-colors mt-8">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                )}

                {view === 'signin' && (
                    <div className="space-y-4 max-w-sm mx-auto">
                        <div className="space-y-1 text-left">
                            <label className="text-sm font-semibold text-dark-700">Email format</label>
                            <input type="email" placeholder="hello@example.com" className="w-full bg-white border border-dark-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" />
                        </div>
                        <div className="space-y-1 text-left">
                            <label className="text-sm font-semibold text-dark-700">Password</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-white border border-dark-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" />
                        </div>
                        <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 mt-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm transition-all shadow-brand-500/20">
                            Log In
                        </button>
                    </div>
                )}

                {view === 'signup' && (
                    <div className="space-y-6 max-w-lg mx-auto">
                        <div className="space-y-4">
                            <div className="space-y-1 text-left">
                                <label className="text-sm font-semibold text-dark-700">Email Address</label>
                                <input type="email" placeholder="hello@example.com" className="w-full bg-white border border-dark-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" />
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-sm font-semibold text-dark-700">Choose a Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter your strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white border border-dark-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
                                />
                            </div>
                        </div>

                        {password.length > 0 && (
                            <div className="pt-4 border-t border-dark-100">
                                <AssistedPasswordConfirmation password={password} />
                            </div>
                        )}

                        <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 mt-8 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm transition-all shadow-brand-500/20">
                            Create Account
                        </button>
                    </div>
                )}

                <div className="mt-16 bg-white border border-dark-200 rounded-2xl p-8 text-center max-w-sm mx-auto">
                    <p className="text-sm text-dark-400 font-medium">
                        Account features coming soon — stay tuned!
                    </p>
                </div>
            </div>
        </div>
    )
}
