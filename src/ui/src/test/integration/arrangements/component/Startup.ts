import Opa5 from 'sap/ui/test/Opa5'
import { ApplicationStartupOptions, IStartup } from '../IStartup'

/**
 * @namespace bubu-cms.test.integration.arrangements.component
 */
export default class Startup extends Opa5 implements IStartup {
  iStartMyApp (options: ApplicationStartupOptions = {}): void {
    // const delay: number = options.serverDelay ?? 1
    const hash: string = options.hash ?? ''
    return this.iStartMyUIComponent({
      componentConfig: {
        name: 'bubu-cms',
        manifest: true
      },
      hash,
      autoWait: true
    })
  }
}
