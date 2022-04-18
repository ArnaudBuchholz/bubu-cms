import testStorage from './storageTester.test'
import { MemoryStorage } from './memory'

describe('storages/memory', () => {
  testStorage(new MemoryStorage())
})
