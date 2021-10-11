import { readTextFile } from './readTextFile'
import { FieldType, FieldDefinition, StoredTypeDefinition } from '../types/TypeDefinition'
import { $tag, FieldName, FieldValue, StorableRecord, StoredRecordRating } from '../types/StoredRecord'
import { LogType, ILoader } from './ILoader'
import { CsvLoader } from './types'

const parsers: Record<FieldType, (value: string) => FieldValue> = {
  string: (value: string): FieldValue => value,
  number: (value: string): FieldValue => parseInt(value, 10),
  date: (value: string): FieldValue => new Date(value)
}

function parseValue (value: string, fieldType: FieldType): FieldValue {
  return parsers[fieldType](value)
}

function fail (loader: ILoader, message: string, details?: object): Error {
  loader.log(LogType.error, 'loader.csv', message, details)
  return new Error(message)
}

export async function loadFromCSV (loader: ILoader, settings: CsvLoader): Promise<number> {
  loader.log(LogType.info, 'loader.csv', `Loading from '${settings.csv}'`)
  const separator: string = settings.separator ?? ','
  const tagSeparator: string = settings.tagSeparator ?? '|'
  const typeDef: StoredTypeDefinition | null = await loader.getType(settings.$type)
  if (typeDef === null) {
    throw fail(loader, `Unknown type '${settings.$type}'`)
  }
  const lines = (await readTextFile(settings.csv))
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('#'))
  const columns = lines.shift()?.split(separator)
  if (columns === undefined) {
    throw fail(loader, 'Empty file')
  }
  const columnType: Record<FieldName, FieldType> = typeDef.fields
    .reduce((mapping: Record<FieldName, FieldType>, field: FieldDefinition): Record<FieldName, FieldType> => {
      mapping[field.name] = field.type
      return mapping
    }, {})
  const allowedColumns = ['$name', '$icon', '$rating', '$touched', '$tags', ...typeDef.fields.map(field => field.name)]
  if (!columns.every(column => allowedColumns.includes(column))) {
    throw fail(loader, `Unknown column for type '${settings.$type}'`)
  }
  let recordIndex = 0
  for await (const line of lines) {
    const values: string[] = line.split(separator)
    const record: StorableRecord = {
      type: typeDef.id,
      name: '',
      fields: {},
      refs: {}
    }
    let index: number = 0
    for await (const column of columns) {
      const value = values[index]
      if (column === '$name') {
        record.name = value
      } else if (column === '$icon') {
        record.icon = value
      } else if (column === '$rating') {
        record.rating = parseInt(value, 10) as StoredRecordRating
      } else if (column === '$touched') {
        record.touched = new Date(value)
      } else if (column === '$tags') {
        record.refs[$tag] = []
        const listOfTagNames = value.split(tagSeparator)
        for await (const tagName of listOfTagNames) {
          const tagId: string | null = await loader.getTagId(tagName)
          if (tagId === null) {
            throw fail(loader, 'Unknown tag', {
              tagName,
              recordIndex,
              record
            })
          }
          record.refs[$tag].push(tagId)
        }
      } else {
        record.fields[column] = parseValue(value, columnType[column])
      }
      ++index
    }
    try {
      await loader.create(record)
    } catch (error) {
      throw fail(loader, 'Error while storing record', {
        error,
        recordIndex,
        record
      })
    }
    ++recordIndex
  }
  return recordIndex
}
