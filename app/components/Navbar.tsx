'use client';
import { useAuth } from '@/app/context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
            <h1 className="text-slate-800 font-semibold text-base sm:text-lg">
                Intern Management System
            </h1>

            <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}
