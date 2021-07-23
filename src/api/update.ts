import { IStorage, UpdateInstructions } from '../types/IStorage'
import { isStoredRecord, StoredRecord } from '../types/StoredRecord'

export async function update (storage: IStorage, jsonBody: object): Promise<void> {
  if (!isStoredRecord(jsonBody)) {
    throw new Error('Not a record')
  }
  const { type, id } = jsonBody
  const record: undefined | StoredRecord = await storage.get(type, id)
  if (record === undefined) {
    throw new Error('Not existing')
  }
  const instructions: UpdateInstructions = {
    fields: {},
    refs: {
      add: {},
      del: {}
    }
  }
  let updates: number = 0
  if (jsonBody.name !== record.name) {
    instructions.name = jsonBody.name
    ++updates
  }
  if (updates > 0) {
    await storage.update(type, id, instructions)
  }
}
