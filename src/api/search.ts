import { isStoredRecordRefs, $type, $tag, $typefield } from '../types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, SortableField } from '../types/IStorage'
import { isTypeName, findTypeDefinition } from '../types/TypeDefinition'

export const DEFAULT_PAGE_SIZE: number = 50

interface UrlParameters {
  skip: string
  top: string
  sort: string
  search: string
  name: string
  refs: string
}

type UrlParameterName = keyof UrlParameters

function isValidUrlParameterName (name: string): name is UrlParameterName {
  return ['skip', 'top', 'sort', 'search', 'name', 'refs'].includes(name)
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

function isAValidSearch (value: string, parameters: UrlParameters): void {
  if (parameters.name !== '') {
    throw new Error('Invalid combination of name and search')
  }
}

function isAValidName (value: string, parameters: UrlParameters): void {
  if (parameters.search !== '') {
    throw new Error('Invalid combination of name and search')
  }
}

function isValidRefs (value: string): void {
  const refs = JSON.parse(value)
  if (!isStoredRecordRefs(refs)) {
    throw new Error('Invalid refs')
  }
}

const urlParameterValidators: Record<UrlParameterName, (value: string, parameters: UrlParameters) => void> = {
  skip: isANumber,
  top: isANumber,
  sort: isASortField,
  search: isAValidSearch,
  name: isAValidName,
  refs: isValidRefs
}

function extractUrlParameters (search: string): UrlParameters {
  const parameters: UrlParameters = {
    skip: '0',
    top: DEFAULT_PAGE_SIZE.toString(),
    sort: '',
    search: '',
    name: '',
    refs: ''
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

export function decodeSearchOptions (urlParams: string): SearchOptions {
  const { skip, top, sort, search, name, refs } = extractUrlParameters(urlParams)
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
  if (refs !== '') {
    options.refs = JSON.parse(refs)
  }
  return options
}

export async function search (storage: IStorage, url: string): Promise<SearchResult> {
  const [pathname, urlParams] = url.split('?')
  const options: SearchOptions = decodeSearchOptions(urlParams)
  if (pathname !== '') {
    let type = {
      $tag: $tag,
      $type: $type,
      $typefield: $typefield
    }[pathname]
    if (type === undefined) {
      if (isTypeName(pathname)) {
        const typeDef = await findTypeDefinition(storage, pathname)
        if (typeDef !== null) {
          type = typeDef.id
        }
      }
      if (type === undefined) {
        type = pathname
      }
    }
    if (options.refs === undefined) {
      options.refs = {}
    }
    options.refs.$type = [type]
  }
  return await storage.search(options)
}
