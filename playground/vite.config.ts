import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { injectEnvPlugin } from '../src/index'
import { env } from './examples/modules/env'

export default defineConfig(() => {
  return {
    plugins: [
      injectEnvPlugin({
        module: env,
        path: [
          './examples/paths/json-file.json',
          './examples/paths/md-file.md',
          './examples/paths/.env',
        ],
        typeDefinition: true,
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
