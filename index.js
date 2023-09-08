const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const findConfig = require("find-config");
const bodyParser = require("body-parser");

const app = express();

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: findConfig('.env.dev') });
}

//middleware
app.use(cors());
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.text({ limit: '10mb' }));

app.use("/api", require("./routes/ProductRoutes"));
app.use("/api", require("./routes/SearchRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

