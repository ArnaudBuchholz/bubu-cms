"use strict";

module.exports = () => {
    const
        gpf = require("gpf-js/source"),
        Record = require("./Record"),
        xmlContentHandler = gpf.interfaces.promisify(gpf.interfaces.IXmlContentHandler),
        writer = new gpf.xml.Writer(),
        output = new gpf.stream.WritableString(),
        promise = gpf.stream.pipe(writer, output).then(() => output.toString()),
        promisifiedWriter = xmlContentHandler(writer);
    promisifiedWriter
        .startDocument()
        .startPrefixMapping("edmx", "http://schemas.microsoft.com/ado/2007/06/edmx")
        .startPrefixMapping("m", "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata")
        .startPrefixMapping("", "http://schemas.microsoft.com/ado/2008/09/edm")
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
        .startElement("EntityType", {
            Name: "Record"
        })
        .startElement("Key")
        .startElement("PropertyRef", {
            Name: "Id"
        })
        .endElement() // PropertyRef
        .endElement() // Key
        .then(() => gpf.forEachAsync(Object.keys(Record.prototype), name =>
            promisifiedWriter.startElement("Property", {
                Name: name,
                Type: "Edm.String",
                MaxLength: 10,
                Nullable: false
            })
                .endElement() // Property
        ))
        .endElement() // EntityType
        .startElement("EntityContainer", {
            Name: "BUBU_CMS_Entities",
            "m:IsDefaultEntityContainer": true
        })
        .startElement("EntitySet", {
            Name: "RecordSet",
            EntityType: "BUBU_CMS.Record"
        })
        .endElement() // EntitySet
        .endElement() // EntityContainer
        .endElement() // Schema
        .endElement() // edmx:DataServices
        .endElement() // edmx:Edmx
        .endDocument();
    return promise;
};
