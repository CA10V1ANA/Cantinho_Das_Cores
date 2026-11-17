import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/front-at-pico/' : '/',
  plugins: [react()],
  server: {
    port: 5185,
  },
}))
