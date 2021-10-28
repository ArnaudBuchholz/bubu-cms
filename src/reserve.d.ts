import { EventEmitter } from 'events'
import { IncomingMessage, ServerResponse } from 'http'

declare module reserve {
  type RedirectResponse = undefined | number | string

  type IfMatcher = (request: IncomingMessage, url: string, match: RegExpMatchArray) => boolean | RedirectResponse

  interface BaseMapping {
    match?: string | RegExp
    method?: string
    'invert-match'?: boolean
    'if-match'?: IfMatcher
    'exclude-from-holding-list'?: boolean
    cwd: string
  }

  interface FileMapping {
    file: string
  }

  interface SSLSettings {
    cert: string
    key: string
  }

  interface PropertySchema {
    type?: string
    types?: string[]
    defaultValue?: boolean | number | string | object | function
  }

  interface RedirectContext {
    configuration: IConfiguration
    mapping: BaseMapping
    match: RegExpMatchArray
    redirect: string
    request: IncomingMessage
    response: ServerResponse
  }

  interface Handler {
    schema?: Record<string, string | string[] | PropertySchema>
    method?: string
    validate?: (mapping: BaseMapping, configuration: IConfiguration) => void
    redirect: (context: RedirectContext) => Promise<RedirectResponse>
  }

  type Handlers = Record<string, Handler>

  type Listener = string | ((eventEmitter: EventEmitter) => void)

  interface Configuration {
    hostname?: string
    port?: number
    'max-redirect'?: number
    ssl?: SSLSettings
    http2?: boolean
    httpOptions?: object
    handlers?: Handlers
    listeners?: Listener[]
    mappings: Mapping[]
    extend?: string
  }

  interface IConfiguration {
    readonly handlers: Handlers
    readonly mappings: Mapping[]
    readonly http2: boolean
    readonly protocol: string
    setMappings: (mappings: Mapping[], request: IncomingMessage, timeout?: number) => Promise<void>
    dispatch: (request: IncomingMessage, response: ServerResponse) => void
  }

  function check (configuration: Configuration): Promise<Configuration>
  function log (server: EventEmitter, verbose: boolean): EventEmitter
  function serve (configuration: Configuration): EventEmitter
  function mock (configuration: Configuration, mockedHandlers?: Handlers): Promise<EventEmitter>
}
