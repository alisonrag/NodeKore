const config = require("./conf/config.json");
const App = require("./src/app.js");
const app = new App(config);

app.run();
