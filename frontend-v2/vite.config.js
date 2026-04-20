import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: '127.0.0.1',
        proxy: {
            '/analyze': 'http://127.0.0.1:8080',
            '/register': 'http://127.0.0.1:8080',
            '/login': {
                target: 'http://127.0.0.1:8080',
                // Only proxy non-HTML requests (API calls).
                // Browser page navigations send Accept: text/html and should NOT be proxied.
                bypass(req) {
                    if (req.headers.accept && req.headers.accept.includes('text/html')) {
                        return '/index.html';
                    }
                }
            },
            '/history': 'http://127.0.0.1:8080',
        }
    }
})
