import { readFile } from 'fs/promises'
import { StorableRecord, StoredRecordType } from 'src/types/StoredRecord'
import { ILoader } from './ILoader'
import { CsvLoader } from './types'

export async function loadFromCSV (loader: ILoader, settings: CsvLoader) {
  const separator: string = settings.separator ?? ','
  const typeId: StoredRecordType = await loader.getTypeId(settings.$type)
  const lines = (await readFile(settings.csv)).toString()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('#'))
  const columns = lines.shift()?.split(separator)
  if (columns === undefined) {
    throw new Error('Missing columns')
  }
  lines.forEach(line => {
    const values: string[] = line.split(separator)
    const storableRecord: StorableRecord = {
      type: typeId,
      name: '',
      fields: {},
      refs: {}
    }
  })
}
