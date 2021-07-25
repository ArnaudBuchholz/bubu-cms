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
  let updated: boolean = false
  if (jsonBody.name !== record.name) {
    instructions.name = jsonBody.name
    updated = true
  }
  if (jsonBody.icon !== undefined && jsonBody.icon !== record.icon) {
    instructions.icon = jsonBody.icon
    updated = true
  }
  if (jsonBody.rating !== undefined && jsonBody.rating !== record.rating) {
    instructions.rating = jsonBody.rating
    updated = true
  }
  if (jsonBody.touched !== undefined && (record.touched === undefined || jsonBody.touched.getTime() !== record.touched.getTime())) {
    instructions.touched = jsonBody.touched
    updated = true
  }
  if (updated) {
    await storage.update(type, id, instructions)
  }
}
