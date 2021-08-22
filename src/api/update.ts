import { IStorage, UpdateInstructions } from '../types/IStorage'
import { isDate, isStoredRecord, StoredRecord } from '../types/StoredRecord'
import { join } from '../util/array'

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

export async function update (storage: IStorage, received: object): Promise<void> {
  if (!isStoredRecord(received)) {
    throw new Error('Not a record')
  }
  const { type, id } = received
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
    if (buildInstructions(received, record, name, instructions)) {
      updated = true
    }
  })
  const typeFields = join(Object.keys(record.fields), Object.keys(received.fields))
  typeFields.forEach((name: string) => {
    if (buildInstructions(received.fields, record.fields, name, instructions.fields)) {
      updated = true
    }
  })
  const refTypes = join(Object.keys(record.refs), Object.keys(received.refs))
  refTypes.forEach((type: string) => {
    const receivedRefs: undefined | string[] = received.refs[type]
    const recordRefs: undefined | string[] = record.refs[type]
    if (receivedRefs === undefined) {
      instructions.refs.del[type] = recordRefs
      updated = true
      return
    }
    if (recordRefs === undefined) {
      instructions.refs.add[type] = receivedRefs
      updated = true
      return
    }
    join(receivedRefs, recordRefs)
      .sort((id1: string, id2: string) => id1.localeCompare(id2)) // Ensure testable result
      .forEach((id: string) => {
        if (!recordRefs.includes(id)) {
          if (instructions.refs.add[type] === undefined) {
            instructions.refs.add[type] = []
          }
          instructions.refs.add[type].push(id)
          updated = true
          return
        }
        if (!receivedRefs.includes(id)) {
          if (instructions.refs.del[type] === undefined) {
            instructions.refs.del[type] = []
          }
          instructions.refs.del[type].push(id)
          updated = true
        }
      })
  })
  if (updated) {
    await storage.update(type, id, instructions)
  }
}
