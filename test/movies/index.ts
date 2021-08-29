import { TypeDefinition, IStorage, StoredRecordType, StoredRecord, StoredRecordId, $tag } from '../../src/index'
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
    name: 'release',
    type: 'number'
  }, {
    name: 'length',
    type: 'number'
  }, {
    name: 'book',
    type: 'number'
  }, {
    name: 'page',
    type: 'number'
  }],
  attributes: {
    number: '$book / $page',
    numberUnit: '',
    status1: '$release',
    status2: 'Math.floor($length / 60) + \':\' + ($length % 60).padStart(2, \'0\')'
  }
})

const horror = declareRecord(storage, {
  type: $tag,
  id: '',
  name: 'horror',
  fields: {},
  refs: {}
})

const scifi = declareRecord(storage, {
  type: $tag,
  id: '',
  name: 'scifi',
  fields: {},
  refs: {}
})

declareRecord(storage, {
  type: movieType,
  id: '',
  name: 'Alien',
  fields: {
    imdb: 'tt0078748',
    release: 1979,
    length: 117,
    book: 1,
    page: 1
  },
  refs: {
    [$tag]: [horror, scifi]
  }
})
