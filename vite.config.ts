import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 相對 base，讓 GitHub Pages 專案頁（/<repo>/）下資源正確載入
export default defineConfig({
  base: './',
  plugins: [react()],
})
