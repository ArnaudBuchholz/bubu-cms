import { Fields, StoredRecordId, StoredRecordType } from './StoredRecord'

export interface NewTypedRecord extends Fields {
  $type: StoredRecordType
  $name: string
}

export interface TypedRecord extends NewTypedRecord {
  $id: StoredRecordId
}
