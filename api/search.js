"use strict";

const
    Tag = require("./Tag"),
    tagPrefix = "#",
    tagPrefixLength = tagPrefix.length
;

module.exports = (EntityClass, search) => {
    const
        searchTerms = search
            .split(" ")
            .map(term => term.trim())
            .filter(term => term),
        tags = searchTerms
            .filter(term => term.indexOf(tagPrefix) === 0)
            .map(term => Tag.get(term.substr(tagPrefixLength)))
            .filter(tag => tag)
            .sort((a, b) => a._records.length - b._records.length), // Less references first
        terms = searchTerms
            .filter(term => term.indexOf(tagPrefix) !== 0)
    ;
    let
        records;
    if (tags.length) {
        // AND
        records = tags[0].records(EntityClass);
        tags.slice(1).forEach(tag => {
            records = records.filter(record => record.hasTag(tag));
        });
    } else {
        records = EntityClass.all();
    }
    if (terms.length) {
        // OR
        records = records.filter(record => terms.some(term => record.search(term)));
    }
    return records;
}
