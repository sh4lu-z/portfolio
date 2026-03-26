import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        roadmap: resolve(__dirname, 'roadmap.html'),
        apidocs: resolve(__dirname, 'public/api-docs.html') // මෙන්න මේ පේළිය අලුතෙන් එකතු කළා
      }
    }
  }
});
