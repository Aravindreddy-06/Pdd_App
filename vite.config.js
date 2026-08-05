import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import otpApiPlugin from './vite-plugin-otp.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), otpApiPlugin()],
  base: process.env.VITE_BASE_PATH || './',
})

