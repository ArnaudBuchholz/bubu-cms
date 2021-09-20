import { TypeDefinition } from '../types/TypeDefinition'

export interface RecordSet {
  $type: string
  csv: string
}

export interface Configuration {
  serve?: number
  storage: string
  types: TypeDefinition[]
  records: RecordSet[]
}

export function isConfiguration (value: any): value is Configuration {
  return true
}
