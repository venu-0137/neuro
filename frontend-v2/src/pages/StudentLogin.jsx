import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, User } from 'lucide-react';
import axios from 'axios';
import GlassCard from '../components/GlassCard.jsx';

const StudentLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Always clear existing session first to ensure clean login
            localStorage.clear();

            const response = await axios.post('/login', { username, password });
            
            // Only allow 'user' role logins here to prevent counselors from using this form
            if (response.data.role === 'counselor') {
                setError('Counselor accounts cannot log in here. Please use the main login portal.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('username', username);
            localStorage.setItem('role', response.data.role);
            
            if (response.data.created_by_name) {
                localStorage.setItem('created_by_name', response.data.created_by_name);
            }
            
            navigate('/dashboard');
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (typeof detail === 'string') {
                setError(detail);
            } else if (Array.isArray(detail)) {
                const firstErr = detail[0];
                const field = firstErr?.loc?.join(' > ');
                setError(`${field || 'Error'}: ${firstErr?.msg || 'Validation failed'}`);
                console.error('Validation details:', detail);
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="text-center space-y-2">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold tracking-tight neon-text"
                    >
                        Student Portal
                    </motion.h1>
                    <p className="text-slate-400">
                        Sign in to access your dashboard
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group/input">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                                required
                            />
                        </div>

                        <div className="relative group/input">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="4-Digit Password"
                                maxLength={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-50"
                        style={{ background: 'linear-gradient(to right, #10b981, #14b8a6)', borderColor: '#0d9488' }}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn size={20} />
                                Access Dashboard
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500">
                    Need help? Contact your counselor.
                </p>
            </GlassCard>
        </div>
    );
};

export default StudentLogin;
