import { FieldDefinition } from './FieldDefinition'

export interface TypeDefinition {
  name: string
  labelKey?: string
  defaultIcon?: string
  fields: FieldDefinition[]
}
