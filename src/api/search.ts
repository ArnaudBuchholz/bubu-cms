import { IStorage, SearchResult } from "../types/IStorage"

export default async function search (storage: IStorage, url: string): Promise<SearchResult> {
  const result: SearchResult = {
    records: [],
    count: 0,
    refs: {}
  }
  return result
}