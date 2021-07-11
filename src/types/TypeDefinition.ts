import { FieldDefinition } from './FieldDefinition'

export interface TypeDefinition {
  name: string
  defaultIcon?: string
  fields: FieldDefinition[]
}
