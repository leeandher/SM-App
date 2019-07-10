- create a firebase app
- setup functions online
- setup database online
- use docs to create accessible functions
- test them in postman
- replacing endpoints with express endpoints to consolidate

theres some wack stuff going on with firebase auth right now referring to this

https://github.com/prescottprue/react-redux-firebase/issues/657

this seemeed to work tho :

```sh
$ rm -rf node_modules
$ npm install --save
$ npm install --save firebase firebase-admin
```

## NOTES JOTTED

- onCreate/onDelete trigger functions
- deploy vs serve locally
- controllers for organization
- helper methods to chain .catches
- notifications
- Indexing complicated db queries firebase link thing
- batch writing
  - creating a series of operations
  - do them all at once
