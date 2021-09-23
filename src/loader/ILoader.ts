import { NewTypedRecord, TypedRecord } from '../types/Record'

export interface ILoader {
  log: (...content: any[]) => void
  add: (record: NewTypedRecord) => TypedRecord
}
