import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Configuração básica do Vite com suporte a React (JSX e Fast Refresh)
export default defineConfig({
  plugins: [react()],
})