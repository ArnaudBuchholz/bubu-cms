import BaseController from './BaseController'
import Event from 'sap/ui/base/Event'
import JSONModel from 'sap/ui/model/json/JSONModel'
import CustomData from 'sap/ui/core/CustomData'
import ObjectPageLayout from 'sap/uxap/ObjectPageLayout'
import ObjectPageSection from 'sap/uxap/ObjectPageSection'
import StandardListItem from 'sap/m/StandardListItem'
import SectionAPI from './SectionAPI'
import { StoredRecord, StoredRecordType } from 'src/types/StoredRecord'

export default class RecordController extends BaseController {
  section: SectionAPI = new SectionAPI(this)

  onInit (): void {
    this.getRouter().getRoute('record').attachPatternMatched(this.onDisplayRecord, this)
  }

  private onDisplayRecord (event: Event): void {
    /*
    const recordType = event.getParameter('arguments').type
    const recordId = event.getParameter('arguments').id
    const page = this.byId('page')

    const sPath = '/' + this.getOwnerComponent().getModel().createKey('RecordSet', {
        id: recordId
      })
      this.getView().bindElement({
        path: sPath,
        parameters: {
          expand: 'toContent'
        },
        events: {
          change: this._onBindingChanged.bind(this),
          dataRequested: function () {
            page.setBusy(true)
          }
        }
      })
*/
  }

  _setContent (content: any): void {
    this.getView().setModel(new JSONModel(content), 'content')
  }

  private showSection (section: ObjectPageSection): void {
    (this.byId('page') as ObjectPageLayout).setSelectedSection(section)
  }

  private isContentSectionVisible (expectedType: StoredRecordType, record: StoredRecord): boolean {
    return record.type === expectedType && this.getModel('content').getProperty('/recordId')
  }

  private displayContent (record: StoredRecord): void {
    /*
      let content = record.toContent
      if (content.__ref) {
        content = this.getView().getModel().getObject('/' + content.__ref)
      }
      this._setContent(JSON.parse(content.data))
*/
    const objectPage: ObjectPageLayout = this.byId('page') as ObjectPageLayout
    const section: ObjectPageSection | undefined = objectPage.getSections().filter(function (candidate: ObjectPageSection) {
      return candidate.getCustomData().some(function (customData: CustomData) {
        return customData.getKey() === 'recordType' && customData.getValue() === record.type
      })
    })[0]
    if (section !== undefined) {
      this.showSection(section)
    } else {
      /*
        Fragment.load({
          id: 'section.json.' + record.type,
          name: 'bubu-cms/api/' + record.type,
          controller: this
        }).then(function (section) {
          this.getView().addDependent(section)
          section.bindProperty('visible', {
            path: '',
            formatter: this._isContentSectionVisible.bind(section, record.type)
          })
          section.addCustomData(new CustomData({
            key: 'recordType',
            value: record.type
          }))
          this.byId('page').insertSection(section, 0)
          this._showSection(section)
        }.bind(this))
*/
    }
  }
  /*
    _handleContent: function (record) {
      if (!record.toContent) {
        this._setContent({})
        return
      }
      return this._displayContent(record)
    },
*/

  /*
    _onBindingChanged: function () {
      const page = this.byId('page')
      const binding = this.getView().getElementBinding()
      if (!binding.getBoundContext()) {
        MessageBox.show(this.i18n('record', 'notLoaded'), {
          icon: MessageBox.Icon.ERROR,
          title: this.i18n('db', 'title'),
          actions: [MessageBox.Action.CLOSE],
          onClose: this.onBack.bind(this)
        })
        return
      }
      this.byId('rating').getBinding('value').refresh(true) // Force refresh
      const record = binding.getBoundContext().getObject()
      page.setModel(new JSONModel({
        list: record.tags.split(' ').map(function (tag) {
          return {
            id: tag,
            name: this.i18n('tag', tag) || tag
          }
        }, this)
      }), 'tags')
      this._handleContent(record)
      page.setBusy(false)
    },
*/

  onBack (): void {
    if (history.length > 1) {
      history.back()
    } else {
      this.getRouter().navTo('list', {}, undefined, true)
    }
  }

  onTagPress (event: Event): void {
    const tag: any = (event.getSource() as StandardListItem).getBindingContext('tags').getObject()
    this.navigateToListFilteredByTag(tag.id)
  }
/*
    _updateRecord (body) {
      const view = this.getView()
      view.getModel().update(view.getBindingContext().getPath(), body, {
        error: () => {
          MessageBox.show(this.i18n('record', 'submitChanges.error'), {
            icon: MessageBox.Icon.ERROR,
            title: this.i18n('db', 'title'),
            actions: [MessageBox.Action.CLOSE]
          })
        }
      })
    },

    onRatingChanged: function (event) {
      this._updateRecord({ rating: event.getSource().getValue() })
    },

    onTouch: function () {
      this._updateRecord({ touched: '/Date(' + new Date().getTime() + ')/' })
    }
*/
}
