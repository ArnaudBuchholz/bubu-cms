import { readFile } from 'fs/promises'

export async function readTextFile (path: string): Promise<string> {
  return (await readFile(path)).toString()
}
