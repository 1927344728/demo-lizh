import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  chainWebpack: config => {
    config
    .plugin('eslint')
    .tap(args => {
      args[0].fix = true
      return args
    })
  },
  server: {
    port: 9911,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  plugins: [vue()],
})
