import { Loader } from './Loader'
import { Configuration, body } from 'reserve'
import { IStorage } from '../types/IStorage'
import { create } from '../api/create'
import { search } from '../api/search'
import { IncomingMessage, ServerResponse } from 'http'

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
      match: /^\/api\/(search\?.*)/,
      custom: async (request: IncomingMessage, response: ServerResponse, url: string): Promise<void> => {
        const { storage } = request
        serialize(response, await search(storage, url))
      }
    }, {
      method: 'POST',
      match: /^\/api\/create/,
      custom: async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
        const { storage } = request
        const result = {
          id: await create(storage, deserialize(request))
        }
        serialize(response, result)
      }
    }, {
      method: 'POST',
      match: /^\/api\/update/,
      custom: async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
        const { storage } = request
        const result = {
          id: await create(storage, deserialize(request))
        }
        serialize(response, result)
      }
    }]
  }
}
