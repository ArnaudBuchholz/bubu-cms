import Component from '../Component'
import Router from 'sap/m/routing/Router'
import Controller from 'sap/ui/core/mvc/Controller'
import ResourceBundle from 'sap/base/i18n/ResourceBundle'
import { StoredRecordRating } from '../types/StoredRecord'
import Model from 'sap/ui/model/Model'
import ResourceModel from 'sap/ui/model/resource/ResourceModel'
import JSONModel from 'sap/ui/model/json/JSONModel'
import { Settings } from '../model/Settings'
import Storage from '../model/Storage'

/**
 * @namespace bubu-cms.controller
 */
export default class BaseController extends Controller {
  protected getComponent (): Component {
    return this.getOwnerComponent() as Component
  }

  protected getRouter (): Router {
    return this.getComponent().getRouter() as Router
  }

  protected getModel (name: string | undefined = undefined): Model {
    return this.getView().getModel(name) ?? this.getComponent().getModel(name)
  }

  protected getSettings (): Settings {
    const settingsModel = this.getComponent().getModel('settings') as JSONModel
    return settingsModel.getData() as Settings
  }

  protected getStorage (): Storage {
    return this.getComponent().getModel() as Storage
  }

  private i18nResourceBundle: ResourceBundle | null = null

  protected async i18n (key: string, ...params: string[]): Promise<string> {
    if (this.i18nResourceBundle === null) {
      this.i18nResourceBundle = await (this.getOwnerComponent().getModel('i18n') as ResourceModel).getResourceBundle()
    }
    return this.i18nResourceBundle.getText(key, params)
  }

  /*
  getTextIfInI18n (resourceBundle, key, params) {
    if (resourceBundle.hasText(key)) {
      return resourceBundle.getText(key, params)
    }
  }

    _getResourceBundle: function (modelName) {
      return this.getOwnerComponent().getModel('db.i18n')._oResourceBundle
    },

    dbI18n: function (key, params) {
      if (!this._dbI18n) {
        this._dbI18n = this._getResourceBundle('db.i18n')
      }
      return this.getTextIfInI18n(this._dbI18n, key, params)
    },

    uiI18n: function (key, params) {
      if (!this._uiI18n) {
        this._uiI18n = this._getResourceBundle('i18n')
      }
      return this.getTextIfInI18n(this._uiI18n, key, params)
    },

    i18n: function (type, key, parameters) {
      const translationKey = type + '.' + key

      let result = this.dbI18n(translationKey, parameters)
      if (undefined === result) {
        result = this.uiI18n(translationKey, parameters)
      }
      return result
    },

    formatIcon: function (type, icon) {
      if (icon) {
        return icon
      }
      const defaultIcon = this.i18n(type, 'defaultIcon')
      if (defaultIcon) {
        return 'sap-icon://' + defaultIcon
      }
      return ''
    },

    formatNumberUnit: function (type) {
      return this.i18n(type, 'numberUnit')
    },

    formatStatus1: function (type) {
      return this.i18n(type, 'status1')
    },

    formatStatus2: function (type) {
      return this.i18n(type, 'status2')
    }
*/

  public renderRating (rating?: StoredRecordRating): string {
    if (rating !== undefined) {
      return new Array(rating + 1).join('\u2605') + new Array(6 - rating).join('\u2606')
    }
    return ''
  }

  /*
    renderTags: function (tags) {
      // First tag is always object type
      return tags
        .split(' ')
        .slice(1)
        .map(function (tag) {
          return this.i18n('tag', tag) || tag
        }, this)
        .join(' ')
    },
*/

  protected escapeSearch (search: string): string {
    return encodeURIComponent(search.replace(/#/g, '__tag__'))
  }

  protected unescapeSearch (search: string): string {
    return decodeURIComponent(search).replace(/__tag__/g, '#')
  }

  public navigateToListFilteredByTag (tag: string): void {
    this.getRouter().navTo('list', {
      query: {
        search: this.escapeSearch('#' + tag)
      }
    }, undefined, false)
  }
}
