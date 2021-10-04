import { join } from 'path'
import { readFile } from 'fs/promises'
import { isConfiguration, isCsvLoader, isCustomLoader } from './types'
import { storageFactory } from '../storages'
import { saveTypeDefinition } from 'src/types/TypeDefinition'
import { Loader } from './Loader'
import { loadFromCSV } from './csv'

export async function load (cwd: string): Promise<void> {
  const configuration = JSON.parse((await readFile(join(cwd, '.bubu-cms.json'))).toString())
  if (!isConfiguration(configuration)) {
    throw new Error('Invalid configuration')
  }
  const storage = storageFactory(configuration.storage)
  if (storage === null) {
    throw new Error('Unknown storage')
  }
  for await (const type of configuration.types) {
    await saveTypeDefinition(storage, type)
  }
  const loader = new Loader(storage)
  for await (const loaderSettings of configuration.loaders) {
    if (isCsvLoader(loaderSettings)) {
      await loadFromCSV(loader, loaderSettings)
    } else if (isCustomLoader(loaderSettings)) {
      const loaderFunc: Function = await import(loaderSettings.loader) as Function
      await loaderFunc(loader)
    }
  }
}
