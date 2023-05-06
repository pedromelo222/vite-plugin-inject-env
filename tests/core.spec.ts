import { describe, expect, it } from 'vitest'
import { loadEnvFile } from '../src/index'

describe('core', () => {
  /**
     * .env file
     */
  it('should import envs from .env file', async () => {
    const env = await loadEnvFile({
      path: './tests/env-files/.env',
    })
    expect(env).toMatchSnapshot()
  })
  /**
     * md file
     */
  it('should import envs from MD file', async () => {
    const env = await loadEnvFile({
      path:
                './tests/env-files/md-file.md',
    })
    expect(env).toMatchSnapshot()
  })
  /**
     * yml file
     */
  it('should import envs from YML file', async () => {
    const env = await loadEnvFile({
      path: './tests/env-files/yml-file.yml',
    })
    expect(env).toMatchSnapshot()
  })
  /**
     * .json file
     */
  it('should import envs from JSON file', async () => {
    const env = await loadEnvFile({
      path: './tests/env-files/json-file.json',
    })
    expect(env).toMatchSnapshot()
  })
  /**
     *  javascript object
     */
  it('should import envs from a javascript object', async () => {
    const { envJs } = await import('./env-files/env')
    const env = await loadEnvFile({
      module: envJs,
    })
    expect(env).toMatchSnapshot()
  })
  /**
     *  array of files and modules
     */
  it('should import multiple envs files and modules', async () => {
    const { envJs, envJsTwo } = await import('./env-files/env')
    const env = await loadEnvFile({
      module: [
        envJs,
        envJsTwo,
      ],
      path: [
        './tests/env-files/yml-file.yml',
        './tests/env-files/md-file.md',
        './tests/env-files/json-file.json',
        './tests/env-files/.env',
      ],
    })
    expect(env).toMatchSnapshot()
  })
})
