import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/front-at-pico/' : '/',
  plugins: [react()],
  server: {
    port: 5185,
  },
}))
