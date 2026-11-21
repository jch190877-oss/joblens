import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' 让构建产物可以在任意静态托管的子路径下工作
// （GitHub Pages 项目页 / 对象存储目录 / 本地直接打开 dist/index.html 都行）
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
})
