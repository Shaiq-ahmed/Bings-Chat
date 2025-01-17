import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(), // Rollup plugin for Node.js polyfills
  ],
  define: {
    global: 'globalThis', // Define `global` for browser compatibility
    'process.env': {},    // Define `process.env` for environment variable access
  },
  resolve: {
    alias: {
      // Node.js built-in modules aliases
      stream: 'rollup-plugin-polyfill-node/polyfills/stream',
      crypto: 'rollup-plugin-polyfill-node/polyfills/crypto',
      process: 'rollup-plugin-polyfill-node/polyfills/process',
      url: 'rollup-plugin-polyfill-node/polyfills/url',
      util: 'rollup-plugin-polyfill-node/polyfills/util',
      querystring: 'rollup-plugin-polyfill-node/polyfills/qs',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins for development
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,  // Polyfill for `process`
          buffer: true,   // Polyfill for `Buffer`
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      // Enable rollup polyfills plugin during production bundling
      plugins: [nodePolyfills()],
    },
  },
});


// import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
// import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
// import nodePolyfills from "rollup-plugin-polyfill-node";

// export default defineConfig({
//   // Other rules...
//   resolve: {
//     alias: {
//       url: "rollup-plugin-node-polyfills/polyfills/url",
//       util: "rollup-plugin-node-polyfills/polyfills/util",
//       querystring: "rollup-plugin-node-polyfills/polyfills/qs",
//     },
//   },
//   optimizeDeps: {
//     esbuildOptions: {
//       // Node.js global to browser globalThis
//       define: {
//         global: "globalThis",
//       },
//       // Enable esbuild polyfill plugins
//       plugins: [
//         NodeGlobalsPolyfillPlugin({
//           buffer: true,
//         }),
//         NodeModulesPolyfillPlugin(),
//       ],
//     },
//   },
//   build: {
//     rollupOptions: {
//       // Enable rollup polyfills plugin
//       // used during production bundling
//       plugins: [nodePolyfills()],
//     },
//   },
// });
