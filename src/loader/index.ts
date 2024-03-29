import { join, isAbsolute } from 'path'
import { readTextFile } from './readTextFile'
import { checkConfiguration, isCsvLoader, isCustomLoader } from './types'
import { storageFactory } from '../storages'
import { saveTypeDefinition } from '../types/TypeDefinition'
import { Loader } from './Loader'
import { loadFromCSV } from './csv'

export async function load (cwd: string): Promise<Loader> {
  const configuration = JSON.parse(await readTextFile(join(cwd, '.bubu-cms.json')))
  try {
    checkConfiguration(configuration)
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Invalid configuration : ${e.message}`)
    } else {
      throw e
    }
  }
  const storage = storageFactory(configuration.storage)
  /* istanbul ignore next */ // It may fail in the future if the storage includes more options
  if (storage === null) {
    throw new Error('Unknown or invalid storage')
  }
  for await (const type of configuration.types) {
    await saveTypeDefinition(storage, type)
  }
  const loader = new Loader(configuration, storage)
  for await (const loaderSettings of configuration.loaders) {
    if (isCsvLoader(loaderSettings)) {
      if (!isAbsolute(loaderSettings.csv)) {
        loaderSettings.csv = join(cwd, loaderSettings.csv)
      }
      await loadFromCSV(loader, loaderSettings)
    } else /* istanbul ignore else */ if (isCustomLoader(loaderSettings)) {
      if (!isAbsolute(loaderSettings.custom)) {
        loaderSettings.custom = join(cwd, loaderSettings.custom)
      }
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
