const { createServer } = require("http"); // you can use https as well
const express = require("express");
const socketIo = require("socket.io");
const path = require("path");
var cors = require("cors");
const app = express();
const server = createServer(app);
const io = socketIo(server, { cors: { origin: "*" } }); // you can change the cors to your own domain
const port = process.env.PORT || 4000;

var allowedOrigins = ["http://localhost", process.env.FRONT_APP_URL];
require("dotenv").config();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use((req, res, next) => {
  req.io = io;
  return next();
});

app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/views/game"));

app.use(require("./routes/register"));
app.use(require("./routes/login"));
app.use(require("./routes/edit"));
app.use(require("./routes/changePswd"));
app.use(require("./routes/deleteUser"));
app.use(require("./routes/showAccInfo"));
app.use(require("./routes/incrementScore"));
app.use(require("./routes/rating"));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("views/index.html"));
});
app.use("/play", require("./routes/game")); // this file's express.Router() will have the req.io too.

server.listen(port, () =>
  console.log(`Server started at http://localhost:${port}`)
);
