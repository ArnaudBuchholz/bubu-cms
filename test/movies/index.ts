import { TypeDefinition, IStorage, StoredRecordType, StoredRecord, StoredRecordId } from '../../src/index'
import { MemoryStorage } from '../../src/storages/memory'

function declareType (storage: IStorage, type: TypeDefinition): StoredRecordType {
  return '0'
}

function declareRecord (storage: IStorage, record: StoredRecord): StoredRecordId {
  return '0'
}

const storage: IStorage = new MemoryStorage()

const movieType = declareType(storage, {
  name: 'movie',
  defaultIcon: 'sap-icon://video',
  fields: [{
    name: 'imdb',
    type: 'string'
  }, {
    name: 'book',
    type: 'number'
  }, {
    name: 'page',
    type: 'number'
  }]
})

declareRecord(storage, {
  type: movieType,
  id: '',
  name: 'Alien',
  fields: {
    imdb: '1324',
    book: 1,
    page: 1
  },
  refs: {}
})
