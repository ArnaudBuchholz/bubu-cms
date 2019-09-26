'use strict'

const EDMX_NAMESPACE = 'http://schemas.microsoft.com/ado/2007/06/edmx'
const METADATA_NAMESPACE = 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'
const EDM_NAMESPACE = 'http://schemas.microsoft.com/ado/2008/09/edm'
const SAP_NAMESPACE = 'http://www.sap.com/Protocols/SAPData'
const SCHEMA_NAMESPACE = 'BUBU_CMS'
const TYPES_MAPPING = {}

const Id = require('../Id')
const Filterable = require('../Filterable')
const Sortable = require('../Sortable')
const NavigationProperty = require('./NavigationProperty')

const entities = require('./entities')
const gpf = require('gpf-js')
const mime = require('mime')

TYPES_MAPPING[gpf.serial.types.string] = 'Edm.String'
TYPES_MAPPING[gpf.serial.types.integer] = 'Edm.Int64'
TYPES_MAPPING[gpf.serial.types.datetime] = 'Edm.DateTime'

const xmlContentHandler = gpf.interfaces.promisify(gpf.interfaces.IXmlContentHandler)
const xmlMimeType = mime.getType('xml')
const writer = new gpf.xml.Writer()
const output = new gpf.stream.WritableString()
const metadata = gpf.stream.pipe(writer, output).then(() => output.toString())
const promisifiedWriter = xmlContentHandler(writer)

const getNavigationProperties = EntityClass => {
  const dictionary = gpf.attributes.get(EntityClass, NavigationProperty)
  return Object.keys(dictionary).map(name => dictionary[name][0])
}

promisifiedWriter
  .startDocument()
  .startPrefixMapping('edmx', EDMX_NAMESPACE)
  .startPrefixMapping('m', METADATA_NAMESPACE)
  .startPrefixMapping('', EDM_NAMESPACE)
  .startPrefixMapping('sap', SAP_NAMESPACE)
  .startElement('edmx:Edmx', {
    Version: '1.0'
  })
  .startElement('edmx:DataServices', {
    'm:DataServiceVersion': '2.0'
  })
  .startElement('Schema', {
    Namespace: SCHEMA_NAMESPACE
    // "xml:lang": "en"
  })
  .then(() => gpf.forEachAsync(entities, EntityClass => {
    const serialProps = gpf.serial.get(EntityClass)
    const sortable = gpf.attributes.get(EntityClass, Sortable)
    const filterable = gpf.attributes.get(EntityClass, Filterable)
    const navigationProperties = getNavigationProperties(EntityClass)
    return promisifiedWriter
      .startElement('EntityType', {
        Name: EntityClass.name
      })
      .startElement('Key')
      .then(() => {
        const keys = gpf.attributes.get(EntityClass, Id)
        return gpf.forEachAsync(Object.keys(keys), member => {
          return promisifiedWriter
            .startElement('PropertyRef', {
              Name: serialProps[member].name
            })
            .endElement() // PropertyRef
        })
      })
      .endElement() // Key
      .then(() => gpf.forEachAsync(Object.keys(serialProps), member => {
        const serial = serialProps[member]
        return promisifiedWriter
          .startElement('Property', {
            Name: serial.name,
            Type: TYPES_MAPPING[serial.type],
            Nullable: !serial.required,
            'sap:creatable': false,
            'sap:updatable': serial.readOnly === false,
            'sap:sortable': Object.prototype.hasOwnProperty.call(sortable, member),
            'sap:filterable': Object.prototype.hasOwnProperty.call(filterable, member)
          })
          .endElement() // Property
      }))
      .then(() => gpf.forEachAsync(navigationProperties, navigationProperty =>
        promisifiedWriter
          .startElement('NavigationProperty', {
            Name: navigationProperty.name,
            Relationship: `${SCHEMA_NAMESPACE}.${navigationProperty.relationshipName}`,
            FromRole: navigationProperty.fromRoleName,
            ToRole: navigationProperty.toRoleName
          })
          .endElement() // NavigationProperty
      ))
      .endElement() // EntityType
      .then(() => gpf.forEachAsync(navigationProperties, navigationProperty =>
        promisifiedWriter
          .startElement('Association', {
            Name: navigationProperty.relationshipName,
            'sap:content-version': 1
          })
          .startElement('End', {
            Type: `${SCHEMA_NAMESPACE}.${navigationProperty.from.name}`,
            Multiplicity: `1`,
            Role: navigationProperty.fromRoleName
          })
          .endElement() // End
          .startElement('End', {
            Type: `${SCHEMA_NAMESPACE}.${navigationProperty.to.name}`,
            Multiplicity: `0..${navigationProperty.multiplicity}`,
            Role: navigationProperty.toRoleName
          })
          .endElement() // End
          .startElement('ReferentialConstraint')
          .startElement('Principal', {
            Role: navigationProperty.fromRoleName
          })
          .startElement('PropertyRef', {
            Name: navigationProperty.principal
          })
          .endElement() // PropertyRef
          .endElement() // Principal
          .startElement('Dependent', {
            Role: navigationProperty.toRoleName
          })
          .startElement('PropertyRef', {
            Name: navigationProperty.dependent
          })
          .endElement() // PropertyRef
          .endElement() // Dependent
          .endElement() // ReferentialConstraint
          .endElement() // Association
      ))
  }))
  .startElement('EntityContainer', {
    Name: `${SCHEMA_NAMESPACE}_Entities`,
    'm:IsDefaultEntityContainer': true
  })
  .then(() => gpf.forEachAsync(entities, EntityClass => {
    const navigationProperties = getNavigationProperties(EntityClass)
    return promisifiedWriter
      .startElement('EntitySet', {
        Name: `${EntityClass.name}Set`,
        EntityType: `${SCHEMA_NAMESPACE}.${EntityClass.name}`
      })
      .endElement() // EntitySet
      .then(() => gpf.forEachAsync(navigationProperties, navigationProperty =>
        promisifiedWriter
          .startElement('AssociationSet', {
            Name: `${navigationProperty.relationshipName}Set`,
            Association: `${SCHEMA_NAMESPACE}.${navigationProperty.relationshipName}`,
            'sap:creatable': false,
            'sap:updatable': false,
            'sap:deletable': false,
            'sap:content-version': 1
          })
          .startElement('End', {
            EntitySet: `${navigationProperty.from.name}Set`,
            Role: navigationProperty.fromRoleName
          })
          .endElement() // End
          .startElement('End', {
            EntitySet: `${navigationProperty.to.name}Set`,
            Role: navigationProperty.toRoleName
          })
          .endElement() // End
          .endElement() // AssociationSet
      ))
  }))
  .endElement() // EntityContainer
  .endElement() // Schema
  .endElement() // edmx:DataServices
  .endElement() // edmx:Edmx
  .endDocument()

module.exports = (request, response) => {
  metadata.then(xml => {
    response.writeHead(200, {
      'Content-Type': xmlMimeType,
      'Content-Length': xml.length
    })
    response.end(xml)
  })
}
