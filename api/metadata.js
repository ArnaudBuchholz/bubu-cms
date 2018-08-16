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
    	.startElement("edmx:DataServices", {
            "m:DataServiceVersion": "2.0"
        })
        .startPrefixMapping("", "http://schemas.microsoft.com/ado/2008/09/edm")
        .startElement("Schema", {
            Namespace: "BUBU-CMS"
            // "xml:lang": "en"
        })
        .startElement("EntityType", {
            Name: "Record"
        })
        .startElement("Key")
        .startElement("PropertyRef", {
            Name: "Id"
        })
        .endElement()
        .endElement()
        .then(() => // gpf.forEachAsync(Object.keys(Record.prototype), name =>
            Promise.Resolve() // Wait until this works
            // promisifiedWriter.startElement("Property", {
            //     Name: "Test",
            //     Type: "Edm.String",
            //     MaxLength: 10,
            //     Nullable: false
            // })
            //     .endElement()
        )
        // ))
        .endElement()
        .endElement()
        .endElement()
        .endDocument();
    return promise;
};
