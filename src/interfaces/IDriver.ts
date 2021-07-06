import { Record } from './Record'
import { Tag } from './Tag'

export type SearchCriteria = {
  top: number,
  skip: number,
  sort: string,
  search?: string
}

interface IDriver {
  search (criteria: SearchCriteria): Promise<Record[]>
  update (id: string, properties: any): Promise<boolean>

}