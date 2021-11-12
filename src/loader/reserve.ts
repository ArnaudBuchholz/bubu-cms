import { Loader } from './Loader'
import { Configuration, body } from 'reserve'
import { IStorage } from '../types/IStorage'
import { search } from '../api/search'
import { create } from '../api/create'
import { update } from '../api/update'
import { deleteRecord } from '../api/delete'
import { IncomingMessage, ServerResponse } from 'http'
import { $tag, $type, $typefield, STOREDRECORDID_REGEX } from '../types/StoredRecord'
import { join } from 'path'

declare module 'http' {
  export interface IncomingMessage {
    storage: IStorage
  }
}

async function deserialize (request: IncomingMessage): Promise<object> {
  return JSON.parse(await body(request))
}

function serialize (response: ServerResponse, data: object): void {
  const json = JSON.stringify(data)
  const length = (new TextEncoder().encode(json)).length
  response.writeHead(200, {
    'content-type': 'application/json',
    'content-length': length
  })
  response.end(json)
}

export function buildConfiguration (loader: Loader): Configuration {
  return {
    port: loader.configuration.serve ?? 8080,
    mappings: [{
      custom: async (request: IncomingMessage): Promise<void> => {
        request.storage = loader.storage
      }
    }, {
      method: 'GET',
      // Need to handle type specification
      match: /^\/api\b(\?.*)/,
      custom: async (request: IncomingMessage, response: ServerResponse, url: string): Promise<void> => {
        const { storage } = request
        serialize(response, await search(storage, url))
      }
    }, {
      method: 'POST',
      match: /^\/api\b/,
      custom: async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
        const { storage } = request
        const result = {
          id: await create(storage, deserialize(request))
        }
        serialize(response, result)
      }
    }, {
      method: 'PUT',
      match: /^\/api\b/,
      custom: async (request: IncomingMessage, response: ServerResponse): Promise<number> => {
        const { storage } = request
        await update(storage, deserialize(request))
        return 204
      }
    }, {
      method: 'DELETE',
      match: new RegExp(`^\\/api\\/(${$tag}|${$type}|${$typefield}|${STOREDRECORDID_REGEX})\\/(${STOREDRECORDID_REGEX})`),
      custom: async (request: IncomingMessage, response: ServerResponse, type: string, id: string): Promise<number> => {
        const { storage } = request
        await deleteRecord(storage, type, id)
        return 200
      }
    }, {
      method: 'GET',
      match: /^\/(.*)/,
      file: join(__dirname, '../ui')
    }]
  }
}
