import { resolve } from 'path'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'

const defaultConfig = {
  build: {
    target: 'es2020',
    minify: false,
    resolve: {
      alias: {
        Vue: 'vue',
        Jax: 'Jax'
      },
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        page01: resolve(__dirname, 'page01.html'),
      },
    },
  },
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log(mode)
  if (mode === 'production') {
    // defaultConfig.plugins.push(legacy({
    //   targets: ['defaults', 'not IE 11'],
    // }))
    return defaultConfig
  } else {
    return defaultConfig
  }
})