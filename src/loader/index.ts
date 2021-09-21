import { join } from 'path'
import { readFile } from 'fs/promises'
import { isConfiguration, isCsvLoader, isCustomLoader } from './types'
import { storageFactory } from '../storages'
import { saveTypeDefinition } from 'src/types/TypeDefinition'

export async function load (cwd: string): Promise<void> {
  const configuration = JSON.parse((await readFile(join(cwd, '.bubu-cms.json'))).toString())
  if (!isConfiguration(configuration)) {
    throw new Error('Invalid configuration')
  }
  const storage = storageFactory(configuration.storage)
  if (storage === undefined) {
    throw new Error('Unknown storage')
  }
  for await (const type of configuration.types) {
    await saveTypeDefinition(storage, type)
  }
  for await (const loader of configuration.loaders) {
    if (isCsvLoader(loader)) {

    } else if (isCustomLoader(loader)) {
      
    }
  }
}
