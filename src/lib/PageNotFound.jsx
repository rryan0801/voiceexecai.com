import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Mic, Home, ArrowLeft } from 'lucide-react';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 mb-12">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900 text-base">VoiceExec<span className="text-blue-600">AI</span></span>
            </Link>

            <div className="max-w-md w-full text-center">
                {/* Big number */}
                <div className="relative mb-8">
                    <p className="text-[120px] font-black text-slate-100 leading-none select-none">404</p>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Mic className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-3">Page not found</h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    {pageName ? (
                        <>The page <span className="font-medium text-slate-700">"{pageName}"</span> doesn't exist.</>
                    ) : (
                        <>This page doesn't exist or has been moved.</>
                    )}
                </p>

                {/* Admin hint */}
                {isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin' && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
                        <p className="text-sm font-semibold text-amber-800 mb-1">Admin note</p>
                        <p className="text-sm text-amber-700 leading-relaxed">
                            This page may not be implemented yet. Ask the AI to build it in the chat.
                        </p>
                    </div>
                )}

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-sm font-medium rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        <Home className="w-4 h-4" /> Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}