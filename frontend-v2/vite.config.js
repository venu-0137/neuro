import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: '127.0.0.1',
        proxy: {
            // Proxy API requests to the backend, but bypass for browser navigations (SPA routing)
            '/analyze': {
                target: 'http://127.0.0.1:8080',
                bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null)
            },
            '/register': {
                target: 'http://127.0.0.1:8080',
                bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null)
            },
            '/login': {
                target: 'http://127.0.0.1:8080',
                bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null)
            },
            '/history': {
                target: 'http://127.0.0.1:8080',
                bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null)
            },
            '/chat': {
                target: 'http://127.0.0.1:8080',
                bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null)
            },
            '/diary': {
                target: 'http://127.0.0.1:8080',
                bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null)
            },
            '/me': {
                target: 'http://127.0.0.1:8080',
                bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null)
            },
            '/counselor': {
                target: 'http://127.0.0.1:8080',
                bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : null)
            }
        }
    }
})
