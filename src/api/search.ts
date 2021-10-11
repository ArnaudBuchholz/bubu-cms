import { IStorage, SearchOptions, SearchResult, SortableField } from '../types/IStorage'

export const DEFAULT_PAGE_SIZE: number = 50

type urlParameterName = 'skip' | 'top' | 'sort' | 'search' | 'name'
type urlParameters = Record<urlParameterName, string>

function isValidUrlParameterName (name: string): name is urlParameterName {
  return ['skip', 'top', 'sort', 'search', 'name'].includes(name)
}

function isANumber (value: string): void {
  if (/\d+/.exec(value) === null) {
    throw new Error('Invalid request parameter value')
  }
}

const sortRegexp: RegExp = /^(name|rating|touched)(?: (asc|desc))?$/
function isASortField (value: string): void {
  if (sortRegexp.exec(value) === null) {
    throw new Error('Invalid request sort parameter')
  }
}

function isAValidSearch (value: string, parameters: urlParameters): void {
  if (parameters.name !== '') {
    throw new Error('Invalid combination of name and search')
  }
}

function isAValidName (value: string, parameters: urlParameters): void {
  if (parameters.search !== '') {
    throw new Error('Invalid combination of name and search')
  }
}

const urlParameterValidators: Record<urlParameterName, (value: string, parameters: urlParameters) => void> = {
  skip: isANumber,
  top: isANumber,
  sort: isASortField,
  search: isAValidSearch,
  name: isAValidName
}

function extractUrlParameters (search: string): urlParameters {
  const parameters: urlParameters = {
    skip: '0',
    top: DEFAULT_PAGE_SIZE.toString(),
    sort: '',
    search: '',
    name: ''
  }
  if (search !== undefined) {
    search.replace(/&?(\w+)=([^&]+)/gy, (match: string, name: string, value: string): string => {
      if (isValidUrlParameterName(name)) {
        const decodedValue: string = decodeURIComponent(value)
        urlParameterValidators[name](decodedValue, parameters)
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
  const [pathname, urlSearch] = url.split('?')
  const { skip, top, sort, search, name } = extractUrlParameters(urlSearch)
  const options: SearchOptions = {
    paging: {
      skip: parseInt(skip, 10),
      top: parseInt(top, 10)
    },
    refs: {}
  }
  const parsedSort = sortRegexp.exec(sort)
  if (parsedSort !== null) {
    options.sort = {
      field: parsedSort[1] as SortableField,
      ascending: parsedSort[2] !== 'desc'
    }
  }
  if (search !== '') {
    options.search = search
  }
  if (name !== '') {
    options.search = name
    options.fullNameOnly = true
  }
  if (pathname === '/records') {
    return await storage.search(options)
  }
  const parsedPathname = pathname.match(/\/records\/(\$type|\$tag|[a-zA-Z]+)$/)
  if (parsedPathname === null) {
    throw new Error('Invalid request')
  }
  const type: undefined | string = parsedPathname[1]
  options.refs.$type = [type]
  return await storage.search(options)
}
