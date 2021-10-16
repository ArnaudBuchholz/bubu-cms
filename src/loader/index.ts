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
  /* istanbul ignore next */ // It may fail in the future if the storage includes more options
  if (storage === null) {
    throw new Error('Unknown or invalid storage')
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
      const module = await import(loaderSettings.custom)
      const loaderFunc: any = module.default
      if (typeof loaderFunc !== 'function') {
        throw new Error('Custom loader not exposing a function')
      }
      await loaderFunc(loader)
    }
  }
  return loader
}
