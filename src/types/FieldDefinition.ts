export interface FieldDefinition {
  name: string
  type: 'string' | 'number' | 'date'
  labelKey?: string
  regexp?: string
  placeholderKey?: string
}
