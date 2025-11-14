import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '')
  
  // Obtener variables de entorno con valores por defecto
  const API_URL = env.VITE_API_URL || 'http://localhost:8001'
  const PORT = parseInt(env.VITE_PORT || '5173', 10)

  return {
    plugins: [react()],
    server: {
      port: PORT,
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          timeout: 600000, // 10 minutos para optimizaciones complejas con muchos productos
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
          },
        },
        '/optimize-stream': {
          target: API_URL,
          changeOrigin: true,
          timeout: 600000,
          ws: false, // No WebSocket, solo SSE
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
          },
        }
      }
    }
  }
})

