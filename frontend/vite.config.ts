import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  // 构建优化
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将第三方库单独打包
          'vendor': ['react', 'react-dom', 'antd'],
          'chart': ['echarts', 'd3'],
          'router': ['react-router-dom'],
          'http': ['axios'],
        },
      },
    },
    // 压缩优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 缓存优化
    cacheDir: path.resolve(__dirname, '.vite_cache'),
  },
  // 依赖优化
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'axios', 'react-router-dom'],
    exclude: [],
  },
  // 解析优化
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})