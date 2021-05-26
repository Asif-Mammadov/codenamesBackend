const { createServer } = require("http"); // you can use https as well
const express = require("express");
const socketIo = require("socket.io");
const path = require("path");
const app = express();
const server = createServer(app);
const io = socketIo(server, { cors: { origin: "*" } }); // you can change the cors to your own domain
const port = 3000;

app.use((req, res, next) => {
  req.io = io;
  return next();
});

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/views/game'));


app.get('/', (req, res) => {
  res.sendFile(path.resolve("views/index.html"))
})
app.use("/play", require("./routes/game")); // this file's express.Router() will have the req.io too.

server.listen(port, () => console.log(`Server started at http://localhost:${port}`));