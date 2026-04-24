import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import GlassCard from './GlassCard';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] text-white">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full"
                    >
                        <GlassCard className="p-8 text-center space-y-6 border-red-500/20 shadow-2xl shadow-red-500/10">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                                <AlertTriangle className="text-red-500" size={40} />
                            </div>
                            
                            <div className="space-y-2">
                                <h1 className="text-2xl font-black">Something went wrong</h1>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    The neural connection was interrupted by an unexpected error. 
                                    We've logged the incident and our systems are recovering.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all"
                                >
                                    <RefreshCw size={18} />
                                    Reload Application
                                </button>
                                <button
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all border border-white/5"
                                >
                                    <Home size={18} />
                                    Return Home
                                </button>
                            </div>
                            
                            <div className="pt-4 text-[10px] text-slate-600 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                                Error: {this.state.error?.message || "Unknown error"}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
