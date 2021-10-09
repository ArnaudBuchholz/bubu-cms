import { readTextFile } from '../../src/loader/readTextFile'
import { join } from 'path'

describe('loader/readTextFile', () => {
  it('reads file', async () => {
    const content = await readTextFile(join(__dirname, 'csv.test.ts'))
    expect(typeof content).toBe('string')
  })
})
