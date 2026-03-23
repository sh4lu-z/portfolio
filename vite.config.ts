import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'; // අලුතින් ඇඩ් කරපු එක

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      tailwindcss(),
      // මේ කොටස තමයි වැදගත්
      viteStaticCopy({
        targets: [
          { src: 'js', dest: '' },      // js folder එක dist/js විදිහට කොපි වෙයි
          { src: 'css', dest: '' },     // css folder එක dist/css විදිහට කොපි වෙයි
          { src: 'images', dest: '' },  // images folder එක dist/images විදිහට කොපි වෙයි
          { src: 'icons', dest: '' }    // icons folder එකත් ඇඩ් කරා
        ]
      })
    ],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          admin: path.resolve(__dirname, 'admin.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          directory: path.resolve(__dirname, 'directory.html'),
          roadmap: path.resolve(__dirname, 'roadmap.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
