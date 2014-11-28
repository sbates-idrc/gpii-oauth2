GPII OAuth2
===========

Get Infusion and dedupe:

- `npm install`
- `grunt dedupe-infusion`

Start servers:

- `cd gpii-oauth2-authorization-server`
- `npm install`
- `node app.js`
- `cd gpii-oauth2-resource-server`
- `npm install`
- `node app.js`
- `cd gpii-oauth2-sample-client`
- `npm install`
- `node app.js`
- `cd gpii-oauth2-sample-client-passport`
- `npm install`
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
- `node test/DatastoreTests.js`
