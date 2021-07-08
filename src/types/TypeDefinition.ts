import { FieldDefinition } from "./FieldDefinition"

export type TypeDefinition = {
  name: string,
  defaultIcon?: string
  fields: FieldDefinition[]
}
