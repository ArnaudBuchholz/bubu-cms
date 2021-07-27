import { IStorage, UpdateInstructions } from '../types/IStorage'
import { isStoredRecord, StoredRecord } from '../types/StoredRecord'
import { types } from 'util'
const { isDate } = types

function buildInstructions (received: Record<string, any>, record: Record<string, any>, field: string, instructions: Record<string, any>): boolean {
  const receivedValue: any = received[field]
  const recordValue: any = record[field]
  if (isDate(receivedValue) || isDate(recordValue)) {
    const receivedTime: number = receivedValue?.getTime() ?? 0
    const recordTime: number = recordValue?.getTime() ?? 0
    if (receivedTime !== recordTime) {
      if (receivedTime === 0) {
        instructions[field] = null
      } else {
        instructions[field] = new Date(receivedTime)
      }
      return true
    }
  } else {
    if (receivedValue !== recordValue) {
      instructions[field] = receivedValue ?? null
      return true
    }
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
  const basicFields = ['name', 'icon', 'rating', 'touched']
  basicFields.forEach((name: string) => {
    if (buildInstructions(jsonBody, record, name, instructions)) {
      updated = true
    }
  })
  const typeFields = [...new Set([...Object.keys(record.fields), ...Object.keys(jsonBody.fields)])]
  typeFields.forEach((name: string) => {
    if (buildInstructions(jsonBody.fields, record.fields, name, instructions.fields)) {
      updated = true
    }
  })
  if (updated) {
    await storage.update(type, id, instructions)
  }
}
