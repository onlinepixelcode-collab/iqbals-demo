import { defineConfig } from 'vite';

// base './' makes every built URL relative, so /dist runs from any subfolder
// (e.g. demo.pixelcode.co.za/iqbals/) without server rewrites.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'static', // keeps hashed bundles apart from public/assets (logo, og image)
    chunkSizeWarningLimit: 900,
  },
});
