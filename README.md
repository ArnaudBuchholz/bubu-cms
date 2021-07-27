# bubu-cms
Small, simple &amp; standalone Content Management System.

[![Node.js CI](https://github.com/ArnaudBuchholz/bubu-cms/actions/workflows/node.js.yml/badge.svg)](https://github.com/ArnaudBuchholz/bubu-cms/actions/workflows/node.js.yml)

## Setup

* `npm install bubu-cms -g`
* Go in the folder with you record descriptions *(see below)*
* `bubu-cms`

## Purpose

When one owns lots of data, it might be helpful to have a common way to dig through it and avoid installing different softwares.
This tool aims to aggregate different kind of data and enables browsing them at ease using tags to organize them.

## Main concepts

### interface

The main interface is a list of record offering sorting & searching options. When a list item is selected, the record
details are displayed.

### Backend

The backend exposes records with a set of predefined properties. Each record can be
qualified with tags (which are exposed separately) and may have a content (initially, HTML).

### Rest API

`GET /records?top=&skip=&sort=<field>[ asc|desc]?&search=<text>`
`GET /records/type?top=&skip=&sort=<field>[ asc|desc]?&search=<text>`

```json
{
  "count": 123,
  "records": [{
    "id": "record_id",
    "type": "type",
    "name": "name",
    "fields": { "...": "..." },
    "refs": { "$tag": [ "..." ], "$type": [ "type" ] }
  }]
}
```

`GET /records/<type>/<id>`

```json
{
    "id": "record_id",
    "type": "<type>",
    "name": "name",
    "fields": { "...": "..." },
    "refs": { "$tag": [ "..." ], "$type": [ "<type>" ] }
}
```

`GET /records/<type>/<id>/content`

Depends on the record
