import { readTextFile } from './readTextFile'
import { join } from 'path'

describe('loader/readTextFile', () => {
  it('reads file', async () => {
    const content = await readTextFile(join(__dirname, 'csv.spec.ts'))
    expect(typeof content).toBe('string')
  })
})
