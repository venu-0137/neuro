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
            '/login': 'http://127.0.0.1:8080',
            '/history': 'http://127.0.0.1:8080',
        }
    }
})
