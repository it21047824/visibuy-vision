const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const findConfig = require("find-config");

const app = express();

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: findConfig('.env.dev') });
}

//middleware
app.use(cors());
app.use(express.json());

app.use("/api", require("./routes/ProductRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

