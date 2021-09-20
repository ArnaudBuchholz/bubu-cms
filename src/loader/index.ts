import { join } from 'path'
import { readFile } from 'fs/promises'
import { isConfiguration } from './types'

export async function load (cwd: string): Promise<void> {
  const configuration: any = JSON.parse((await readFile(join(cwd, '.bubu-cms.json'))).toString())
  if (!isConfiguration(configuration)) {
    throw new Error('Invalid configuration')
  }
  
}
