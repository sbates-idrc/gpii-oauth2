GPII OAuth2
===========

Start servers:

- `cd gpii-oauth2-authorization-server`
- `node app.js`
- `cd gpii-oauth2-resource-server`
- `node app.js`
- `cd gpii-oauth2-sample-client`
- `node app.js`
- `cd gpii-oauth2-sample-client-passport`
- `node app.js`

Pages:

- [http://localhost:3002/](http://localhost:3002/) - Sample client
- [http://localhost:3003/](http://localhost:3003/) - Sample client with Passport
- [http://localhost:3000/privacy](http://localhost:3000/privacy) - Privacy settings

For a list of test users and passwords, see: [the datastore source code](gpii-oauth2-datastore/index.js)

Running the datastore tests
---------------------------

- `cd gpii-oauth2-datastore`
- `npm install`
- `grunt dedupe-infusion`
- `node test/DatastoreTests.js`
