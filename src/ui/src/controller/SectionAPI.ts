import BaseController from './BaseController'
import URLHelper from 'sap/m/URLHelper'

export default class SectionAPI {
  private readonly owner: BaseController

  translateTag (tag: string): string {
    const translated = this.owner.i18n(`tag.${tag}`)
    if (translated === '') {
      return tag
    }
    return translated
  }

  navigateToListFilteredByTag (tag: string): void {
    return this.owner.navigateToListFilteredByTag(tag)
  }

  redirect (url: string): void {
    URLHelper.redirect(url)
  }

  constructor (controller: BaseController) {
    this.owner = controller
  }
}
