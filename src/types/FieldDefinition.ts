export type FieldType = 'string' | 'number' | 'date'

export interface FieldDefinition {
  name: string
  type: FieldType
  labelKey?: string
  regexp?: string
  placeholderKey?: string
}
