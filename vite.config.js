import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/shoes/',
  build: {
    outDir: 'shoes',
    emptyOutDir: true,
  },
})
