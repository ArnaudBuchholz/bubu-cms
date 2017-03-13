# bubu-cms
Small, simple &amp; flat CMS for bubu's family

# Main concepts

Our family has lots of data (recipes, contacts, appointments) and we wanted a common way to access it without the pain
of installing lots of software.

# Plan

STEP 1: backup all recipes and provide an interface to access them
    Search by 'title'
STEP 2: adds tags to documents to categorize them

Web structure:

/api/ => API
/ui/ => WEB UI

Routes:
/list/
/view/<id>

Constraints:
flat files, limited storage
