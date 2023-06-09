export type RecordEnv = {
  [key in string]: any
}

export const importMeta = 'import.meta.env.VITE_APP_' as const

type ParsedKeyType<T extends string | symbol | number> = `${typeof importMeta}${Uppercase<T & string>}`

export type ParsedEnv<T extends RecordEnv> = {
  [Key in ParsedKeyType<keyof T>]: T[Key] | string
}

export type Path<T extends RecordEnv> = T | T[] | string | string[]

export interface ExtendedConfig<T extends RecordEnv> {
  /**
  *
  * Path of env file
  * Accepted files: JSON, YML and MD and javascript object: Record<any, any>
  * example: path: [env, './src/env.json', './.otherEnv'] - path: './src/env.json'
  *
  */
  path: Path<T>
  /**
  *
  * Flag to set if plugin must handle the creation of type definitions for the injected envs
  * path taht typedefinitions are created: 'src/env.d.ts'
  * default is true
  *
  */
  typeDefinition?: boolean
  /**
  *
  * TypeDefinition path
  * path location to store the enviroment type definition
  *
  */
  // typeDefinitionPath?: string
}

export type InjectPluginConfig<T extends RecordEnv> = ExtendedConfig<T> | Path<T>
