"use strict";

const
    gpf = require("gpf/source");
    Record = require("./Record"),
    xmlContentHandler = gpf.interfaces.promisify(gpf.interfaces.IXmlContentHandler);

module.exports = () => {
    const
        writer = new gpf.xml.Writer(),
        output = new gpf.stream.WritableString(),
        promise = gpf.stream.pipe(writer, output).then(() => output.toString());
    xmlContentHandler(writer)
        .startDocument()
        .startPrefixMapping("edmx", "http://schemas.microsoft.com/ado/2007/06/edmx")
        .startPrefixMapping("m", "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata")
        .startPrefixMapping("sap", "http://www.sap.com/Protocols/SAPData")
    	.startElement("edmx:DataServices", {
            "m:DataServiceVersion": "2.0"
        })
        .startPrefixMapping("", "http://schemas.microsoft.com/ado/2008/09/edm")
        .startElement("Schema", {
            Namespace: "BUBU-CMS",
            "xml:lang": "en"
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
        .then(() => {
            // .startElement("Property", {
            //     Name: "Id",
            //     Type: "Edm.String",
            //     MaxLength: 10,
            //     Nullable: false,
            //     "sap:label": "Id",
            //     "sap:unicode": true,
            //     "sap:creatable": false,
            //     "sap:updatable":false,
            //     "sap:sortable": false,
            //     "sap:filterable": false
            //     "sap:visible": false
            // })
            // .endElement()
        })
        .endElement()
        .endElement()
        .endElement()
        .endDocument();
};
