import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from "path";
import fs from "fs";

const key = fs.readFileSync(path.resolve(__dirname, '../cert/key.pem'));
const cert = fs.readFileSync(path.resolve(__dirname, '../cert/cert.pem'));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    disableHostCheck: true,
    port: 8888,
    open: false,
    host: "0.0.0.0",
    allowedHosts: ['o4.decade.tw', 'xpro.local', 'localhost', 'xpro', 'xmax'],
    https: {
      key,
      cert,
    },
    proxy: {
      '/__vite_dev_proxy_1_': {
        changeOrigin: true,
        configure(_, options) {
          options.rewrite = path => {
            const proxyUrl = new URL(path, 'file:'),
                url = new URL(proxyUrl.searchParams.get('url'))

            // Since JS is single threaded, so it won't cause problem
            options.target = url.origin
            return url.pathname + url.search
          }
        },
      },
      '/__vite_dev_proxy_2_': {
        changeOrigin: true,
        target: 'https://decade.tw',
        rewrite(path) {
          const proxyUrl = new URL(path, 'file:'),
              url = new URL(proxyUrl.searchParams.get('url'))
          return url.pathname + url.search
        },
        configure(proxy, options) {
          proxy.on('proxyReq', (proxyReq, req) => {
            const query = req['_parsedUrl']['query'],
                url = new URL(new URLSearchParams(query).get('url'))
            console.log('__vite_dev_proxy__',url)
            // Change target here
            options.target = url.origin
            return url.pathname + url.search

          })
        },
      },
      '^/fallback/.*': {
        target: '',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      '^/fallback2/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
        }
      },
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
      },
    }
  },
  resolve: {
    preserveSymlinks: true,
  },
})
