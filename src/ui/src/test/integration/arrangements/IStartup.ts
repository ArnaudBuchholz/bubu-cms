export type ApplicationStartupOptions = {
  serverDelay?: number
  hash?: string
}

export interface IStartup {
  iStartMyApp (): void
  iStartMyApp (options: ApplicationStartupOptions): void
}
