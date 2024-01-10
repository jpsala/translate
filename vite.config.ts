import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
export default defineConfig(({ mode }) => {
  console.log('Translator running in ', mode)
  return {
    plugins: [react()],
    base: '/translate/'
  }
})
