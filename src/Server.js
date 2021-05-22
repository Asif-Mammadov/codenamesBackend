const express = require("express");
const app = express();
const server = require("http").Server(app);
const port = process.env.PORT || 3000; //heroku port or default port 3000
const io = require("socket.io")(server);

app.use("/", express.static(__dirname + "/client/"));

// Start server
server.listen(port, () => console.log(`Server is running on port ${port}`));

const playerNames = new Map();
const playersInfo = {
  spectators: [],
  blueOps: [],
  redOps: [],
  blueSpy: null,
  redSpy: null,
};

io.on("connection", (socket) => {
  playerNames.set({ socketID: socket.id, username: null });

  socket.emit("updatePlayers", playersInfo);

  socket.on("newPlayerJoined", (name) => {
    const { spectators } = playersInfo;
    playerNames[socket.id] = name;
    //
    console.log("Added to spectators: ", name);
    spectators.push(name);
    io.sockets.emit("addNewPlayer", name);
  });
  socket.on("disconnect", () => {
    const { blueOps, redOps, spectators } = playersInfo;
    const playerName = playerNames[socket.id];
    playerNames.delete(socket.id);

    // Consider if the player have been playing not just watching
    if (blueOps.includes(playerName)) {
      blueOps.splice(blueOps.indexOf(playerName), 1);
      console.log("removing blue: ", playerName);
      io.sockets.emit("removeBlueOp", playerName);
    } else if (redOps.includes(playerName)) {
      redOps.splice(redOps.indexOf(playerName), 1);
      console.log("removing red: ", playerName);
      io.sockets.emit("removeRedOp", playerName);
    } else {
      console.log("removing spectator: ", playerName);
      spectators.splice(spectators.indexOf(playerName), 1);
      io.sockets.emit("removeSpectator", playerName);
    }
  });

  socket.on("joinedBlueOpsFromSpectator", () => {
    const playerName = playerNames[socket.id];
    const { spectators, blueOps } = playersInfo;
    spectators.forEach((element, i) => {
      if (element === playerName) spectators.splice(spectators.indexOf(i), 1);
    });
    blueOps.push(playerName); 
    io.sockets.emit("selectedBlueOps", playerName);
  });

  socket.on("joinedBlueOpsFromRedOps", () => {
    const playerName = playerNames[socket.id];
    const { redOps, blueOps } = playersInfo;
    redOps.forEach((element, i) => {
      if (element === playerName) spectators.splice(spectators.indexOf(i), 1);
    });
    blueOps.push(playerName);
    io.sockets.emit("selectedBlueOps", playerName);
  });

  socket.on("joinedBlueOpsFromBlueSpy",() => {
    const playerName = playerNames[socket.id];
    const { blueSpy } = playersInfo;
    blueSpy = null; 
    blueOps.push(playerName);
    io.sockets.emit("selectedBlueOps", playerName);
  })
});
