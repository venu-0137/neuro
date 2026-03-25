import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analysis from './pages/Analysis.jsx';
import Results from './pages/Results.jsx';
import History from './pages/History.jsx';
import Navbar from './components/Navbar.jsx';
import PageBackground from './components/PageBackground.jsx';
import './styles/global.css';

const backgroundMap = {
    '/': '/backgrounds/misty-forest-sunrise.png',
    '/dashboard': '/backgrounds/mountain-lake-reflection.png',
    '/analysis': '/backgrounds/river-stones.png',
    '/results': '/backgrounds/sunset-sky.png',
    '/history': '/backgrounds/forest-path.png',
};

const blurMap = {
    '/': '10px',
    '/dashboard': '8px',
    '/analysis': '12px',
    '/results': '10px',
    '/history': '8px',
};

function AppContent() {
    const location = useLocation();
    const bgImage = backgroundMap[location.pathname] || backgroundMap['/'];
    const bgBlur = blurMap[location.pathname] || '10px';

    return (
        <div className="relative min-h-screen text-[#E2E8F0] overflow-hidden font-sans">
            <PageBackground image={bgImage} blur={bgBlur} />
            <Navbar />
            <main className="relative z-10 pt-20 px-4 md:px-8 max-w-7xl mx-auto">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/history" element={<History />} />
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
