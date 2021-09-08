import testStorage from './storageTester.helper'
import { MemoryStorage } from '../../src/storages/memory'

describe('storages/memory', () => {
  testStorage(new MemoryStorage())
})
