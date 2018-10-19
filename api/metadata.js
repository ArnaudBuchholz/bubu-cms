"use strict";

const
    EDMX_NAMESPACE = "http://schemas.microsoft.com/ado/2007/06/edmx",
    METADATA_NAMESPACE = "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
    EDM_NAMESPACE = "http://schemas.microsoft.com/ado/2008/09/edm",
    SAP_NAMESPACE = "http://www.sap.com/Protocols/SAPData",

    SCHEMA_NAMESPACE = "BUBU_CMS",

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
            Namespace: SCHEMA_NAMESPACE
            // "xml:lang": "en"
        })
        .then(() => gpf.forEachAsync(entities, EntityClass => {
            const
                serialProps = gpf.serial.get(EntityClass),
                flags = gpf.attributes.get(EntityClass, attributes.Base),
                navigationProperties = attributes.navigationProperties(EntityClass);
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
                .then(() => gpf.forEachAsync(navigationProperties, property =>
                    promisifiedWriter
                        .startElement("NavigationProperty", {
                            name: property.getName(),
                            Relationship: `${SCHEMA_NAMESPACE}.${property.getRelationshipName()}`,
                            FromRole: property.getFromRoleName(),
                            ToRole: property.getToRoleName()
                        })
                        .endElement() // NavigationProperty
                ))
                .endElement() // EntityType
                .then(() => gpf.forEachAsync(navigationProperties, property =>
                    promisifiedWriter
                        .startElement("Association", {
                            Name: property.getRelationshipName(),
                            "sap:content-version": 1
                        })
                        .startElement("End", {
                            Type: `${SCHEMA_NAMESPACE}.${property.from().name}`,
                            Multiplicity: 1,
                            Role: property.getFromRoleName()
                        })
                        .endElement() // End
                        .startElement("End", {
                            Type: `${SCHEMA_NAMESPACE}.${property.to().name}`,
                            Multiplicity: "*",
                            Role: property.getToRoleName()
                        })
                        .endElement() // End
                        .startElement("ReferentialConstraint")
                        .startElement("Principal", {
                            Role: property.getFromRoleName()
                        })
                        .startElement("PropertyRef", {
                            Name: property.getPrincipal()
                        })
                        .endElement() // PropertyRef
                        .endElement() // Principal
                        .startElement("Dependent", {
                            Role: property.getToRoleName()
                        })
                        .startElement("PropertyRef", {
                            Name: property.getDependent()
                        })
                        .endElement() // PropertyRef
                        .endElement() // Dependent
                        .endElement() // ReferentialConstraint
                        .endElement() // Association
                ));
        }))
        .startElement("EntityContainer", {
            Name: `${SCHEMA_NAMESPACE}_Entities`,
            "m:IsDefaultEntityContainer": true
        })
        .then(() => gpf.forEachAsync(entities, EntityClass => {
            const
                navigationProperties = attributes.navigationProperties(EntityClass);
            return promisifiedWriter
                    .startElement("EntitySet", {
                        Name: `${EntityClass.name}Set`,
                        EntityType: `${SCHEMA_NAMESPACE}.${EntityClass.name}`
                    })
                    .endElement() // EntitySet
                    .then(() => gpf.forEachAsync(navigationProperties, property =>
                        promisifiedWriter
                            .startElement("AssociationSet", {
                                Name: `${property.getRelationshipName()}Set`,
                                Association: `${SCHEMA_NAMESPACE}.${property.getRelationshipName()}`,
                                "sap:creatable": false,
                                "sap:updatable": false,
                                "sap:deletable": false,
                                "sap:content-version": 1
                            })
                            .startElement("End", {
                                EntitySet: `${property.from().name}Set`,
                                Role: property.getFromRoleName()
                            })
                            .endElement() // End
                            .startElement("End", {
                                EntitySet: `${property.to().name}Set`,
                                Role: property.getToRoleName()
                            })
                            .endElement() // End
                            .endElement() // AssociationSet
                    ));
        }))
        .endElement() // EntityContainer
        .endElement() // Schema
        .endElement() // edmx:DataServices
        .endElement() // edmx:Edmx
        .endDocument();
    return promise;
};
