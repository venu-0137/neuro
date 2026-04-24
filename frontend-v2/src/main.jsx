import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import axios from 'axios';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Configure axios global defaults for authentication persistence and error handling
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for global error handling
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            console.error("Network error: Backend might be offline");
        } else if (error.response.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
)
