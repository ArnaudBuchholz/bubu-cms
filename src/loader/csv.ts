import { readFile } from 'fs/promises'
import { FieldType, TypeDefinition } from '../types/TypeDefinition'
import { $tag, FieldValue, StorableRecord, StoredRecordRating, StoredRecordType } from '../types/StoredRecord'
import { ILoader } from './ILoader'
import { CsvLoader } from './types'

function isValidColumn (name: string): boolean {
  
}

const parsers: Record<FieldType, (value: string) => FieldValue> = {
  string: (value: string): FieldValue => value,
  number: (value: string): FieldValue => parseInt(value, 10),
  date: (value: string): FieldValue => new Date(value)
}

function parseValue (value: string, fieldType: FieldType): FieldValue {
  return parsers[fieldType](value)
}

export async function loadFromCSV (loader: ILoader, settings: CsvLoader): Promise<void> {
  const separator: string = settings.separator ?? ','
  const typeDef: TypeDefinition | null = await loader.getType(settings.$type)
  if (typeDef === null || typeDef.id === undefined) {
    throw new Error(`Unknown type ${settings.$type}`)
  }
  const lines = (await readFile(settings.csv)).toString()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('#'))
  const columns = lines.shift()?.split(separator)
  if (columns === undefined) {
    throw new Error('Missing columns')
  }
  columns.forEach(column => {
    if (['$name'])
  })
  lines.forEach(line => {
    const values: string[] = line.split(separator)
    const storableRecord: StorableRecord = {
      type: typeDef.id,
      name: '',
      fields: {},
      refs: {}
    }
    columns.forEach((column: string, index: number) => {
      const value = values[index]
      if (column === '$name') {
        storableRecord.name = value
      } else if (column === '$icon') {
        storableRecord.icon = value
      } else if (column === '$rating') {
        storableRecord.rating = parseInt(value, 10) as StoredRecordRating
      } else if (column === '$touched') {
        storableRecord.touched = new Date(value)
      } else if (column === '$tags') {
        // Process tags (assuming a list of space separated values)
        storableRecord.refs[$tag] = value.split(' ') // asynchronous...
      } else {
        storableRecord.fields[column] = 
      }
  })
}
