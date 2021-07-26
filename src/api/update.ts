import { IStorage, UpdateInstructions } from '../types/IStorage'
import { isStoredRecord, StoredRecord } from '../types/StoredRecord'

function compare (received: Record<string, any>, record: Record<string, any>, field: string, instructions: Record<string, any>): boolean {
  if (received[field] !== record[field]) {
    instructions[field] = received[field] ?? null
    return true
  }
  return false
}

export async function update (storage: IStorage, jsonBody: object): Promise<void> {
  if (!isStoredRecord(jsonBody)) {
    throw new Error('Not a record')
  }
  const { type, id } = jsonBody
  const record: null | StoredRecord = await storage.get(type, id)
  if (record === null) {
    throw new Error('Not existing')
  }
  const instructions: UpdateInstructions = {
    fields: {},
    refs: {
      add: {},
      del: {}
    }
  }
  let updated: boolean = false
  if (compare(jsonBody, record, 'name', instructions)) {
    updated = true
  }
  if (compare(jsonBody, record, 'icon', instructions)) {
    updated = true
  }
  if (compare(jsonBody, record, 'rating', instructions)) {
    updated = true
  }
  const jsonBodyTouched = jsonBody.touched?.getTime() ?? 0
  const recordTouched = record.touched?.getTime() ?? 0
  if (jsonBodyTouched !== recordTouched) {
    if (jsonBodyTouched === 0) {
      instructions.touched = null
    } else {
      instructions.touched = new Date(jsonBodyTouched)
    }
    updated = true
  }
  const fields = [...new Set([...Object.keys(record.fields), ...Object.keys(jsonBody.fields)])]
  fields.forEach(name => {
    if (compare(jsonBody.fields, record.fields, name, instructions.fields)) {
      updated = true
    }
  })
  if (updated) {
    await storage.update(type, id, instructions)
  }
}
