import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

// Get current directory path
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      
      manifest: false,
      
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg}'],
      },
      devOptions: {
        enabled: true, 
      },
      strategies: 'injectManifest',
      srcDir: 'scripts', 
      filename: 'sw.js',
    }),
  ],
});
