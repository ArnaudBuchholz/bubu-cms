import Component from '../Component'
import Router from 'sap/m/routing/Router'
import Controller from 'sap/ui/core/mvc/Controller'

/**
 * @namespace bubu-cms.controller
 */
export default class BaseController extends Controller {

  private getComponent(): Component {
    return this.getOwnerComponent() as Component
  }

  private getRouter (): Router {
    return this.getComponent().getRouter() as Router
  }

  getTextIfInI18n (resourceBundle, key, params) {
    if (resourceBundle.hasText(key)) {
      return resourceBundle.getText(key, params)
    }
  },

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

    public renderRating (value) {
      return new Array(value + 1).join('\u2605') + new Array(6 - value).join('\u2606')
    },

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

    escapeSearch: function (search) {
      return encodeURIComponent(search.replace(/#/g, '__tag__'))
    },

    unescapeSearch: function (search) {
      return decodeURIComponent(search).replace(/__tag__/g, '#')
    }

  })
})
