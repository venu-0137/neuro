import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analysis from './pages/Analysis.jsx';
import Results from './pages/Results.jsx';
import History from './pages/History.jsx';
import NeuralAssistant from './pages/NeuralAssistant.jsx';
import MoodMachine from './pages/MoodMachine.jsx';
import Diary from './pages/Diary.jsx';
import Sidebar from './components/Sidebar.jsx';
import { Menu } from 'lucide-react';
import PageBackground from './components/PageBackground.jsx';
import './styles/global.css';

const backgroundMap = {
    '/': '/backgrounds/misty-forest-sunrise.png',
    '/dashboard': '/backgrounds/mountain-lake-reflection.png',
    '/analysis': '/backgrounds/river-stones.png',
    '/results': '/backgrounds/sunset-sky.png',
    '/history': '/backgrounds/forest-path.png',
    '/assistant': 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=2000',
    '/mood-machine': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000',
    '/diary': 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&q=80&w=2000'
};

const blurMap = {
    '/': '10px',
    '/dashboard': '8px',
    '/analysis': '12px',
    '/results': '10px',
    '/history': '8px',
    '/assistant': '10px',
    '/mood-machine': '10px',
    '/diary': '12px'
};

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    
    const bgImage = backgroundMap[location.pathname] || backgroundMap['/'];
    const bgBlur = blurMap[location.pathname] || '10px';
    const isLoginPage = location.pathname === '/' || location.pathname === '/login';

    // Global authentication check on page load/navigation
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token && !isLoginPage) {
            navigate('/login');
        }
    }, [location.pathname, isLoginPage, navigate]);

    return (
        <div className="relative min-h-screen text-[#E2E8F0] overflow-hidden font-sans">
            <PageBackground image={bgImage} blur={bgBlur} />
            
            {!isLoginPage && (
                <>
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="fixed top-8 left-8 z-50 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:scale-110 active:scale-95 transition-all shadow-2xl backdrop-blur-xl group"
                    >
                        <Menu className="text-white group-hover:text-indigo-400" />
                    </button>
                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                </>
            )}

            <main className={`relative z-10 ${isLoginPage ? '' : (location.pathname === '/dashboard' ? 'pt-0' : 'pt-24 md:pt-32')} px-4 md:px-8 max-w-7xl mx-auto`}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/assistant" element={<NeuralAssistant />} />
                    <Route path="/mood-machine" element={<MoodMachine />} />
                    <Route path="/diary" element={<Diary />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
        </Router>
    );
}

export default App;
