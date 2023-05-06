import { readFile } from 'node:fs/promises'

export function transformStringToObject(text: string) {
  const textObject: Record<string | symbol | number, any> = {}
  const lines = text.split('\n')
  lines.forEach((line: string) => {
    if (line !== '') {
      const [key, value] = line.split('=')
      if (key.trim() !== '' && value.trim() !== '')
        textObject[key.trim()] = value.trim()
    }
  })
  return textObject
}

export async function getFile({ path, enconding = 'utf-8' }: { path: string; enconding?: BufferEncoding }) {
  if ((path.includes('.js') || path.includes('.mjs')) && !path.includes('.json')) {
    const file = import(`${path}`)
    return file
  }
  return await readFile(path, enconding)
}

// helper function to find index of start of interface
export function findFileIndex(str: string, searchStr: string) {
  const index = str.indexOf(searchStr)
  return index !== -1 ? (index + searchStr.length - 1) : index
}

// helper function to find closing brace index
export function findClosingBraceIndex(str: string, start: number) {
  let count = 1
  for (let i = start + 1; i < str.length; i++) {
    if (str[i] === '{')
      count++
    if (str[i] === '}')
      count--
    if (count === 0)
      return i
  }
  return -1
}

/**
 * Check if searchIndex exist and inject code param inside the baces of the file
 * if searchIndex dont exist inject full code at the last line
 */
export function replaceOrCreateNewCode(fileData: string, searchIndex: string, code: string) {
  const start = findFileIndex(fileData, searchIndex)
  if (start === -1)
    return `${fileData}\n\n${searchIndex}\n${`${code}}`}`

  const openingBraceIndex = fileData.indexOf('{', start)
  if (openingBraceIndex === -1)
    throw new Error('Invalid interface definition')

  const end = findClosingBraceIndex(fileData, openingBraceIndex)
  return `${fileData.slice(0, openingBraceIndex + 1)}\n${`${code}}`}${fileData.slice(end + 1)}`
}

/**
 *
 * Read file and return or return empty string if file dont exist
 */
export async function readFileIgnoreError(filePath: string, enconding: 'utf-8' = 'utf-8'): Promise<string> {
  try {
    const data = await readFile(filePath, enconding)
    return data
  }
  catch (error: any) {
    if (error.code === 'ENOENT')
      return ''

    else throw error
  }
}
