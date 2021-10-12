import { join, isAbsolute } from 'path'
import { readTextFile } from './readTextFile'
import { isConfiguration, isCsvLoader, isCustomLoader } from './types'
import { storageFactory } from '../storages'
import { saveTypeDefinition } from '../types/TypeDefinition'
import { Loader } from './Loader'
import { loadFromCSV } from './csv'

export async function load (cwd: string): Promise<Loader> {
  const configuration = JSON.parse(await readTextFile(join(cwd, '.bubu-cms.json')))
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
      if (!isAbsolute(loaderSettings.csv)) {
        loaderSettings.csv = join(cwd, loaderSettings.csv)
      }
      await loadFromCSV(loader, loaderSettings)
    } else if (isCustomLoader(loaderSettings)) {
      const loaderFunc: Function = await import(loaderSettings.loader) as Function
      await loaderFunc(loader)
    }
  }
  return loader
}
