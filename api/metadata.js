"use strict";

const
    EDMX_NAMESPACE = "http://schemas.microsoft.com/ado/2007/06/edmx",
    METADATA_NAMESPACE = "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
    EDM_NAMESPACE = "http://schemas.microsoft.com/ado/2008/09/edm",
    SAP_NAMESPACE = "http://www.sap.com/Protocols/SAPData",

    TYPES_MAPPING = {},

    gpf = require("gpf-js/source"),
    attributes = require("./attributes"),
    entities = require("./entities");

TYPES_MAPPING[gpf.serial.types.string] = "Edm.String";
TYPES_MAPPING[gpf.serial.types.integer] = "Edm.Int64";
TYPES_MAPPING[gpf.serial.types.datetime] = "Edm.DateTime";

module.exports = () => {
    const
        xmlContentHandler = gpf.interfaces.promisify(gpf.interfaces.IXmlContentHandler),
        writer = new gpf.xml.Writer(),
        output = new gpf.stream.WritableString(),
        promise = gpf.stream.pipe(writer, output).then(() => output.toString()),
        promisifiedWriter = xmlContentHandler(writer),

        has = (flags, member, Attribute) => (flags[member] || []).some(attribute => attribute instanceof Attribute);

    promisifiedWriter
        .startDocument()
        .startPrefixMapping("edmx", EDMX_NAMESPACE)
        .startPrefixMapping("m", METADATA_NAMESPACE)
        .startPrefixMapping("", EDM_NAMESPACE)
        .startPrefixMapping("sap", SAP_NAMESPACE)
        .startElement("edmx:Edmx", {
            Version: "1.0"
        })
    	.startElement("edmx:DataServices", {
            "m:DataServiceVersion": "2.0"
        })
        .startElement("Schema", {
            Namespace: "BUBU_CMS"
            // "xml:lang": "en"
        })
        .then(() => gpf.forEachAsync(entities, EntityClass => {
            const
                serialProps = gpf.serial.get(EntityClass),
                flags = gpf.attributes.get(EntityClass, attributes.Base);
            return promisifiedWriter
                .startElement("EntityType", {
                    Name: EntityClass.name
                })
                .startElement("Key")
                .then(() => {
                    const
                        keys = gpf.attributes.get(EntityClass, attributes.Key);
                    return gpf.forEachAsync(Object.keys(keys), member => {
                        return promisifiedWriter
                            .startElement("PropertyRef", {
                                Name: serialProps[member].name
                            })
                            .endElement() // PropertyRef
                    });
                })
                .endElement() // Key
                .then(() => gpf.forEachAsync(Object.keys(serialProps), member =>
                    promisifiedWriter
                        .startElement("Property", {
                            Name: serialProps[member].name,
                            Type: TYPES_MAPPING[serialProps[member].type],
                            Nullable: !serialProps[member].required,
                            "sap:creatable": has(flags, member, attributes.Creatable),
                            "sap:updatable": has(flags, member, attributes.Updatable),
                            "sap:sortable": has(flags, member, attributes.Sortable),
                            "sap:filterable": has(flags, member, attributes.Filterable)
                        })
                        .endElement() // Property
                ))
                .endElement() // EntityType
        }))
        .startElement("EntityContainer", {
            Name: "BUBU_CMS_Entities",
            "m:IsDefaultEntityContainer": true
        })
        .then(() => gpf.forEachAsync(entities, EntityClass =>
            promisifiedWriter
                .startElement("EntitySet", {
                    Name: `${EntityClass.name}Set`,
                    EntityType: `BUBU_CMS.${EntityClass.name}`
                })
                .endElement() // EntitySet
        ))
        .endElement() // EntityContainer
        .endElement() // Schema
        .endElement() // edmx:DataServices
        .endElement() // edmx:Edmx
        .endDocument();
    return promise;
};
