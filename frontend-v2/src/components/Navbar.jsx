import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, LogOut, Home, History as HistoryIcon, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/';

    if (isLoginPage) return null;

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl"
        >
            <div className="glass-card py-4 px-8 flex items-center justify-between !rounded-full bg-white/5 border-white/5 backdrop-blur-2xl">
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl neon-text hidden md:block">NeuroTalk AI</span>
                </Link>

                <div className="flex items-center gap-4 md:gap-8">
                    <NavItem to="/dashboard" icon={<Home size={20} />} label="Home" active={location.pathname === '/dashboard'} />
                    <NavItem to="/analysis" icon={<PlusCircle size={20} />} label="New" active={location.pathname === '/analysis'} />
                    <NavItem to="/history" icon={<HistoryIcon size={20} />} label="History" active={location.pathname === '/history'} />

                    <button className="flex items-center gap-2 hover:text-red-400 transition-colors ml-4 pl-4 border-l border-white/10">
                        <LogOut size={20} />
                        <span className="hidden md:block">Logout</span>
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};

const NavItem = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-2 transition-all duration-300 relative group
      ${active ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
    >
        {icon}
        <span className="hidden md:block text-sm font-medium">{label}</span>
        {active && (
            <motion.div
                layoutId="active-nav"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"
            />
        )}
    </Link>
);

export default Navbar;
