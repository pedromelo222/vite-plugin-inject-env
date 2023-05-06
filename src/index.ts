import { writeFile } from 'node:fs/promises'
import type { Plugin } from 'vite'
import { getFile, readFileIgnoreError, replaceOrCreateNewCode, transformStringToObject } from './file-utils'
import { importMeta } from './types'
import type { InjectPluginConfig, ParsedEnv, RecordEnv } from './types'

/**
 * Create vite env file to use as vite define config
 * { 'import.meta.env.VITE_APP_BASE_URL': '...' }
 */
export function parseEnv<T extends RecordEnv>(env: T): ParsedEnv<T> {
  const envTemp = {} as ParsedEnv<T>
  Object.keys(env).map(key => envTemp[`${importMeta}${key.toUpperCase()}` as keyof ParsedEnv<T>] = JSON.stringify(env[key]))
  return envTemp
}

/**
 * Returns array from single config or array config
 */
function createArrayFromConfig<T>(config: T[] | T | undefined) {
  return Array.isArray(config) ? [...config] : typeof config !== 'undefined' ? [config] : []
}

/**
 * Returns one array of modules and paths
 */
function getArrayFromConfig<T extends RecordEnv>({ module, path }: Pick<InjectPluginConfig<T>, 'module' | 'path'>) {
  return [...createArrayFromConfig(module), ...createArrayFromConfig(path)]
}

/**
 *  Return all envs from path and module into same object
 */
export async function loadEnvFile<T extends RecordEnv>({ module, path }: Pick<InjectPluginConfig<T>, 'module' | 'path'>) {
  const config = getArrayFromConfig({ module, path })
  const envObject: RecordEnv = Object.assign({}, ...await Promise.all(config.map(async (item) => {
    if (typeof item === 'string') {
      const file = await getFile({ path: item })
      if (item.includes('.md') || item.includes('.yml') || item.includes('.env'))
        return { ...parseEnv<T>(transformStringToObject(file)) }

      if (item.includes('.json'))
        return { ...parseEnv<T>(JSON.parse(file)) }
    }
    else if (typeof item === 'object') {
      return { ...parseEnv<T>(item) }
    }
  })))
  return envObject
}

/**
 * Create or edit env.d.ts to add type
 *
 */
async function replaceEnvTypeDefinition<T extends RecordEnv>(env: ParsedEnv<T> | undefined, filePath = './src/env.d.ts') {
  try {
    const data = await readFileIgnoreError(filePath)
    const newData = replaceOrCreateNewCode(data, 'interface ImportMetaEnv {', setInterfaceText(env))
    await writeFile(filePath, newData)
  }
  catch (err) {
    console.error(err)
  }
}

/**
 * Write type definition in string
 * "interface ImportMetaEnv { ... }"
 */
function setInterfaceText<T extends RecordEnv>(env: ParsedEnv<T> | undefined) {
  return Object.keys(env || {}).map(key => `  readonly ${key.split('import.meta.env.')[1]}: string\n`).join('')
}

/**
 *
 * vite-plugin-inject-env
 * inject enviroment variables into vite from '.md' '.yml' '.json' and 'js object'
 *
 */
export async function injectEnvPlugin<T extends RecordEnv>(pluginConfig: InjectPluginConfig<T>): Promise<Plugin> {
  const env = await loadEnvFile(pluginConfig)
  return {
    name: 'vite-inject-env-plugin',
    config: () => ({
      define: env,
    }),
    async configResolved() {
      if (pluginConfig.typeDefinition !== false) {
        try {
          await replaceEnvTypeDefinition(env)
        }
        catch (error: any) {
          throw new Error(`[TypeDefinition] - Error when creating types \n${error}`)
        }
      }
    },
  }
}
