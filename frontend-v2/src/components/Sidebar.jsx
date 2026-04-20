import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    User, HelpCircle, LogOut, Home, 
    PlusCircle, History, MessageSquare, X, Brain 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/dashboard', label: 'Home', icon: <Home size={20} /> },
        { path: '/analysis', label: 'New Analysis', icon: <PlusCircle size={20} /> },
        { path: '/history', label: 'History', icon: <History size={20} /> },
        { path: '/assistant', label: 'Neural Assistant', icon: <MessageSquare size={20} /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        onClose();
        navigate('/');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 h-full w-80 bg-slate-900/90 backdrop-blur-2xl border-r border-white/5 z-[70] p-8 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <Brain className="text-indigo-400" size={24} />
                                </div>
                                BolMitra
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
                            {/* User Profile */}
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 flex-shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-bold">{localStorage.getItem('username') || 'Guest'}</p>
                                    <p className="text-xs text-slate-400 font-medium">Cognitive Tier: Alpha</p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-4">Core Interface</p>
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                                            ${location.pathname === item.path 
                                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                                            }`}
                                    >
                                        <div className={`${location.pathname === item.path ? 'text-indigo-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                                            {item.icon}
                                        </div>
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                ))}

                                <div className="mt-8 pt-8 border-t border-white/5 space-y-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4 mb-4">Support & Identity</p>
                                    <Link
                                        to="/assistant"
                                        onClick={onClose}
                                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                                    >
                                        <HelpCircle size={20} className="text-slate-500" />
                                        <span className="font-medium">Help Centre</span>
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10 group"
                                    >
                                        <LogOut size={20} className="text-slate-500 group-hover:text-red-400" />
                                        <span className="font-medium">Log out</span>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
