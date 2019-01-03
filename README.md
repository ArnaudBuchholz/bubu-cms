# bubu-cms
Small, simple &amp; standalone CMS for my family

# Purpose

My family owns lots of data (recipes, movies, contacts...) and we wanted a common way to access it without the pain
of installing lots of software.

The purpose is to offer a simple interface to browse and display data.

# Main concepts

## interface

The main interface is a list of record offering sorting & searching options. When a list item is selected, the record
details are displayed.

## Backend

The backend exposes records with a set of predefined properties (name, icon, number, rating...). Each record can be
qualified with tags (which are exposed separately) and may have a content (initially, HTML).

Databases are loaded once for all in memory and can be composed of flat files (CSV, JSON) or even generated content.
