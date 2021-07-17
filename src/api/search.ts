import { IStorage, SearchResult } from '../types/IStorage'

export const DEFAULT_PAGE_SIZE: number = 50

type urlParameterName = 'skip' | 'top'
type urlParameters = Record<urlParameterName, string>

function isValidUrlParameterName (name: string): name is urlParameterName {
  return ['skip', 'top'].includes(name)
}

function isANumber (value: string): void {
  if (/\d+/.exec(value) === null) {
    throw new Error('Invalid request parameter value')
  }
}

const urlParameterValidators: Record<urlParameterName, (value: string) => void> = {
  skip: isANumber,
  top: isANumber
}

function extractUrlParameters (search: string): urlParameters {
  const parameters: urlParameters = {
    skip: '0',
    top: DEFAULT_PAGE_SIZE.toString()
  }
  if (search !== undefined) {
    search.replace(/&?(\w+)=([^&]+)/gy, (match: string, name: string, value: string): string => {
      if (isValidUrlParameterName(name)) {
        const decodedValue: string = decodeURIComponent(value)
        urlParameterValidators[name](decodedValue)
        parameters[name] = decodedValue
      } else {
        throw new Error('Invalid request parameter name')
      }
      return match
    })
  }
  return parameters
}

export async function search (storage: IStorage, url: string): Promise<SearchResult> {
  const [pathname, search] = url.split('?')
  const { skip, top } = extractUrlParameters(search)
  const paging = {
    skip: parseInt(skip, 10),
    top: parseInt(top, 10)
  }

  if (pathname === '/records') {
    return await storage.search({
      paging,
      refs: {}
    })
  }
  throw new Error('Invalid request')
}
