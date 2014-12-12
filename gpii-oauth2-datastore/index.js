var fluid = require("infusion");

var loader = fluid.getLoader(__dirname);

loader.require("./src/InMemoryDataStore.js");
loader.require("./src/DataStoreWithSampleData.js");
