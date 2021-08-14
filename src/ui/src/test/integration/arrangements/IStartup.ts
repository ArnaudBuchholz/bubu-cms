export interface ApplicationStartupOptions {
  serverDelay?: number
  hash?: string
}

export interface IStartup {
  iStartMyApp: (() => void) & ((options: ApplicationStartupOptions) => void)
}
