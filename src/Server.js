const express = require("express");
const app = express();
const server = require("http").Server(app);
const port = process.env.PORT || 3000; //heroku port or default port 3000
const io = require("socket.io")(server);
const gameFunc = require("./Game");

app.use("/", express.static(__dirname + "/client/"));

// Start server
server.listen(port, () => console.log(`Server is running on port ${port}`));

const playerNames = [];
const playersInfo = {
  spectators: [],
  blueOps: [],
  redOps: [],
  blueSpy: { socketID: null, username: null },
  redSpy: { socketID: null, username: null },
  host: { socketID: null, username: null },
};

const gameInfo = {
  started: false,
  maxNOps: 4,
  maxNSpies: 1,
  board: [],
  labels: [],
  redScore: 8,
  blueScore: 8,
  blueStarts: true,
  turnBlue: true,
  turnSpy: false,
  turnN: 0,
};

//temporary

const wordList = [
  "Addendum",
  "Advertise",
  "Aircraft",
  "Aisle",
  "Alligator",
  "Alphabetize",
  "America",
  "Ankle",
  "Apathy",
  "Applause",
  "Applesauc",
  "Application",
  "Archaeologist",
  "Aristocrat",
  "Arm",
  "Armada",
  "Asleep",
  "Astronaut",
  "Athlete",
  "Atlantis",
  "Aunt",
  "Avocado",
  "Baby-Sitter",
  "Backbone",
  "Bag",
];
const room = "room";
io.on("connection", (socket) => {
  socket.join(room);
  playerNames.push({
    socketID: socket.id,
    username: null,
    score: {
      Op: { right: 0, wrong: 0, i: 0, a: 0 },
      Spy: { right: 0, wrong: 0, i: 0, a: 0 },
    },
  });
  socket.emit("updatePlayers", playersInfo);
  if (gameInfo.started) {
    socket.emit("getBoard", gameInfo.board);
  }
  socket.on("newPlayerJoined", (client, name) => {
    if(playerNames.map(player => player.username).includes(name)){
      socket.emit("alertFromServer", "Name is occupied");
      return;
    }
    const { spectators } = playersInfo;
    const playerIndex = playerNames
      .map((player) => player.socketID)
      .indexOf(socket.id);
    playerNames[playerIndex].username = name;

    spectators.push({ socketID: socket.id, username: name });

    if (playersInfo.host.username === null) {
      setCell(playersInfo.host, socket.id, name);
    }
    client.name = name;
    setClient(client, "", false, false);
    socket.emit("updateRole", client);
    io.sockets.in(room).emit("updatePlayers", playersInfo);
  });
  socket.on("disconnect", () => {
    const { blueOps, redOps, spectators, blueSpy, redSpy } = playersInfo;
    const playerIndex = playerNames
      .map((player) => player.socketID)
      .indexOf(socket.id);
    const playerName = playerNames[playerIndex].username;

    playerNames.splice(playerIndex, 1);
    if (playersInfo.host.socketID === socket.id) {
      // io.sockets.in(room).emit("removeHost", playersInfo.host.username);
      setCell(playersInfo.host, null, null);
      for (let i = 0; i < playerNames.length; i++) {
        if (playerNames[i].username !== null) {
          setCell(
            playersInfo.host,
            playerNames[i].socketID,
            playerNames[i].username
          );
          break;
        }
      }
      if (playersInfo.host.socketID === null) {
        console.log("reset game");
        gameFunc.resetGame(gameInfo);
      }
      io.sockets
        .in(room)
        .emit("serverMsg", playersInfo.host.socketID, "You are host now!");
    }
    // Consider if the player have been playing not just watching
    if (blueOps.map((i) => i.username).includes(playerName)) {
      const index = blueOps.map((i) => i.username).indexOf(playerName);
      blueOps.splice(index, 1);
      // io.sockets.in(room).emit("removeBlueOp", playerName);
    } else if (redOps.map((i) => i.username).includes(playerName)) {
      const index = redOps.map((i) => i.username).indexOf(playerName);
      redOps.splice(index, 1);
      // io.sockets.in(room).emit("removeRedOp", playerName);
    } else if (blueSpy.username === playerName) {
      setCell(blueSpy, null, null);
      // io.sockets.in(room).emit("removeBlueSpy", playerName);
    } else if (redSpy.username === playerName) {
      setCell(redSpy, null, null);
      console.log("Red spy", redSpy);
      // io.sockets.in(room).emit("removeRedSpy", playerName);
    } else {
      const index = spectators.map((i) => i.socketID).indexOf(socket.id);
      spectators.splice(spectators.indexOf(index), 1);
      // io.sockets.in(room).emit("removeSpectator", playerName);
    }
    console.log(playersInfo);
    io.sockets.in(room).emit("updatePlayers", playersInfo);
  });

  socket.on("joinedBlueOps", (client) => {
    const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo;
    // if spectator
    if (
      client.name === "" ||
      blueOps.map((i) => i.username).includes(client.name)
    ) {
      console.log("Player already in list");
      return;
    }
    if (blueOps.length >= gameInfo.maxNOps) {
      console.log("Team is full");
      socket.emit("alertFromServer", "Team is full");
      return;
    }
    if (client.team === "") {
      client.team = "b";
      const indexSpectator = spectators
        .map((spectator) => spectator.username)
        .indexOf(client.name);
      spectators.splice(indexSpectator, 1);
      blueOps.push({ socketID: socket.id, username: client.name });
    } else if (client.team === "r") {
      client.team = "b";
      if (client.isSpymaster) {
        client.isSpymaster = false;
        setCell(redSpy, null, null);

        blueOps.push({ socketID: socket.id, username: client.name });
      } else {
        const index = redOps.map((i) => i.username).indexOf(client.name);
        redOps.splice(index, 1);
        blueOps.push({ socketID: socket.id, username: client.name });
      }
    } else if (client.team === "b" && client.isSpymaster) {
      client.isSpymaster = false;
      setCell(blueSpy, null, null);
      blueOps.push({ socketID: socket.id, username: client.name });
    }
    io.sockets.in(room).emit("updatePlayers", playersInfo);

    //update
    setClient(client, "b", false, gameInfo.turnBlue);
    socket.emit("updateRole", client);
  });

  socket.on("joinedRedOps", (client) => {
    const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo;
    // if spectator
    if (
      client.name === "" ||
      redOps.map((i) => i.username).includes(client.name)
    ) {
      console.log("Player already in list");
      return;
    }
    if (redOps.length >= gameInfo.maxNOps) {
      console.log("Team is full");
      socket.emit("alertFromServer", "Team is full");
      return;
    }
    if (client.team === "") {
      client.team = "r";
      const index = spectators.map((i) => i.username).indexOf(client.name);
      spectators.splice(index, 1);
      redOps.push({ socketID: socket.id, username: client.name });
    } else if (client.team === "b") {
      client.team = "r";
      if (client.isSpymaster) {
        client.isSpymaster = false;
        setCell(blueSpy, null, null);
        redOps.push({ socketID: socket.id, username: client.name });
      } else {
        client.team = "r";
        const index = blueOps.map((i) => i.username).indexOf(client.name);
        blueOps.splice(index, 1);

        redOps.push({ socketID: socket.id, username: client.name });
      }
    } else if (client.team === "r" && client.isSpymaster) {
      client.isSpymaster = false;
      setCell(redSpy, null, null);
      redOps.push({ socketID: socket.id, username: client.name });
    }
    io.sockets.in(room).emit("updatePlayers", playersInfo);
    //update
    setClient(client, "r", false, !gameInfo.turnBlue);
    socket.emit("updateRole", client);
    console.log(playersInfo);
  });

  socket.on("joinedBlueSpy", (client) => {
    const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo;
    // if spectator
    if (client.name === "") {
      console.log("Player already in list");
      return;
    }
    // check if blueSpy is not occupied
    if (spyExists(blueSpy)) {
      console.log("Occupied by someone else");
      socket.emit("alertFromServer", "occupied by someone else");
      return;
    }
    if (client.team === "") {
      client.team = "b";
      const index = spectators.map((i) => i.username).indexOf(client.name);
      spectators.splice(index, 1);
    } else if (client.team === "r") {
      client.team = "b";
      if (client.isSpymaster) {
        setCell(redSpy, null, null);
      } else {
        const index = redOps.map((i) => i.username).indexOf(client.name);
        redOps.splice(index, 1);
      }
    } else if (client.team === "b" && !client.isSpymaster) {
      const index = blueOps.map((i) => i.username).indexOf(client.name);
      blueOps.splice(index, 1);
      // io.sockets.in(room).emit("removeBlueOps", client.name);
    }
    client.isSpymaster = true;
    setCell(blueSpy, socket.id, client.name);
    io.sockets.in(room).emit("updatePlayers", playersInfo);
    //update
    setClient(client, "b", true, gameInfo.turnBlue);
    socket.emit("updateRole", client);
    if(gameInfo.started){
      socket.emit("getLabels", gameInfo.labels);
    }
    console.log(playersInfo);
  });

  socket.on("joinedRedSpy", (client) => {
    const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo;
    // if spectator
    if (client.name === "") {
      console.log("Player already in list");
      return;
    }
    // check if blueSpy is not occupied
    if (spyExists(redSpy)) {
      console.log("Occupied by someone else");
      socket.emit("alertFromServer", "occupied by someone else");
      return;
    }
    if (client.team === "") {
      console.log("no here");
      client.team = "r";
      const index = spectators.map((i) => i.username).indexOf(client.name);
      spectators.splice(index, 1);
    } else if (client.team === "b") {
      console.log("here");
      client.team = "r";
      if (client.isSpymaster) {
        setCell(blueSpy, null, null);
      } else {
        const index = blueOps.map((i) => i.username).indexOf(client.name);
        blueOps.splice(index, 1);
      }
    } else if (client.team === "r" && !client.isSpymaster) {
      console.log("I am here");
      const index = redOps.map((i) => i.username).indexOf(client.name);
      redOps.splice(index, 1);
    }
    client.isSpymaster = true;
    setCell(redSpy, socket.id, client.name);
    io.sockets.in(room).emit("updatePlayers", playersInfo);
    //update
    setClient(client, "r", true, !gameInfo.turnBlue);
    socket.emit("updateRole", client);
    if(gameInfo.started){
      socket.emit("getLabels", gameInfo.labels);
    }
  });

  /* Game */
  socket.on("startGame", () => {
    gameFunc.resetGame(gameInfo);
    // check if is host
    if (socket.id !== playersInfo.host.socketID) {
      socket.emit("alertFromServer", "Only host can start the game!");
      return;
    }
    // if (playersInfo.redSpy.socketID === null || playersInfo.blueSpy.socketID === null ){
    //   socket.emit("alertFromServer", "Spymaster is empty!")
    //   return;
    // }
    // if(playersInfo.blueOps.length === 0 || playersInfo.redOps.length === 0){
    //   socket.emit("alertFromServer", "Operatives are empty!");
    //   return;
    // }
    gameFunc.initGame(gameInfo, wordList);
    io.sockets.in(room).emit("gameStarted", gameInfo.blueStarts);

    io.sockets
      .in(room)
      .emit("getLabels", playersInfo.blueSpy.socketID, gameInfo.labels);
    io.sockets
      .in(room)
      .emit("getLabels", playersInfo.redSpy.socketID, gameInfo.labels);

    io.sockets.in(room).emit("getBoard", gameInfo.board);

    if (gameInfo.turnBlue && gameInfo.turnSpy) {
      io.sockets.in(room).emit("turnBlueSpy", playersInfo.blueSpy.socketID);
      io.sockets.in(room).emit("enterClue", playersInfo.blueSpy.socketID);
    } else if (!gameInfo.turnBlue && gameInfo.turnSpy) {
      io.sockets.in(room).emit("turnRedSpy", playersInfo.redSpy.socketID);
      io.sockets.in(room).emit("enterClue", playersInfo.redSpy.socketID);
    }
  });

  socket.on("clueEntered", (clue) => {
    gameInfo.turnSpy = false;
    io.sockets.in(room).emit("shareClue", clue);
    if (gameInfo.turnBlue) {
      io.sockets.in(room).emit("chooseCard", "b", false);
    } else {
      io.sockets.in(room).emit("chooseCard", "r", false);
    }
  });

  socket.on("cardChosen", (cardId) => {
    let i = gameInfo.board[cardId].label;
    if (i !== "n") {
      socket.emit("alertFromServer", "already opened");
      return;
    }
    const curLabel = (gameInfo.board[cardId].label = gameInfo.labels[cardId]);
    io.sockets.in(room).emit("getBoard", gameInfo.board);
    if (gameInfo.turnBlue) {
      if (curLabel === "b") {
        //give score to op
        let index = playerNames
          .map((player) => player.socketID)
          .indexOf(socket.id);
        playerNames[index].score.Op.right++;

        //give score to spy
        index = playerNames
          .map((player) => player.socketID)
          .indexOf(playersInfo.blueSpy.socketID);
        playerNames[index].score.Spy.right++;

        //decrease score
        gameInfo.blueScore--;
      } else if (curLabel === "r") {
        //give score to op
        let index = playerNames
          .map((player) => player.socketID)
          .indexOf(socket.id);
        playerNames[index].score.Op.wrong++;

        //give score to spy
        index = playerNames
          .map((player) => player.socketID)
          .indexOf(playersInfo.blueSpy.socketID);
        playerNames[index].score.Spy.wrong++;

        gameInfo.redScore--;
        endTurn(gameInfo, playersInfo);
      } else if (curLabel === "i") {
        //give score to op
        let index = playerNames
          .map((player) => player.socketID)
          .indexOf(socket.id);
        playerNames[index].score.Op.i++;

        //give score to spy
        index = playerNames
          .map((player) => player.socketID)
          .indexOf(playersInfo.blueSpy.socketID);
        playerNames[index].score.Spy.i++;

        endTurn(gameInfo, playersInfo);
      } else if (curLable === "a") {
        //give score to op
        let index = playerNames
          .map((player) => player.socketID)
          .indexOf(socket.id);
        playerNames[index].score.Op.i++;

        //give score to spy
        index = playerNames
          .map((player) => player.socketID)
          .indexOf(playersInfo.blueSpy.socketID);
        playerNames[index].score.Spy.i++;

        endGame("Red team won");
      }
    } else {
      if (curLabel === "r") {
        //give score to op
        let index = playerNames
          .map((player) => player.socketID)
          .indexOf(socket.id);
        playerNames[index].score.Op.right++;

        //give score to spy
        index = playerNames
          .map((player) => player.socketID)
          .indexOf(playersInfo.redSpy.socketID);
        playerNames[index].score.Spy.right++;

        //decrease score
        gameInfo.redScore--;
      } else if (curLabel === "b") {
        //give score to op
        let index = playerNames
          .map((player) => player.socketID)
          .indexOf(socket.id);
        playerNames[index].score.Op.wrong++;

        //give score to spy
        index = playerNames
          .map((player) => player.socketID)
          .indexOf(playersInfo.redSpy.socketID);
        playerNames[index].score.Spy.wrong++;

        gameInfo.blueScore--;
        endTurn(gameInfo, playersInfo);
      } else if (curLabel === "i") {
        //give score to op
        let index = playerNames
          .map((player) => player.socketID)
          .indexOf(socket.id);
        playerNames[index].score.Op.i++;

        //give score to spy
        index = playerNames
          .map((player) => player.socketID)
          .indexOf(playersInfo.redSpy.socketID);
        playerNames[index].score.Spy.i++;

        endTurn(gameInfo, playersInfo);
      } else if (curLable === "a") {
        //give score to op
        let index = playerNames
          .map((player) => player.socketID)
          .indexOf(socket.id);
        playerNames[index].score.Op.i++;

        //give score to spy
        index = playerNames
          .map((player) => player.socketID)
          .indexOf(playersInfo.redSpy.socketID);
        playerNames[index].score.Spy.i++;

        endGame("Blue team won");
      }
    }
    let index = playerNames.map((player) => player.socketID).indexOf(socket.id);
    playerNames[index].score.Op.i++;
    console.log(
      "scores :",
      gameInfo.blueScore,
      " ",
      gameInfo.redScore,
      "  pl: ",
      playerNames[index].score.Op.right
    );
    if (gameInfo.blueScore === 0) endGame("Blue team won");
    else if(gameInfo.redScore === 0) endGame("Red team won");
  });
  socket.on("endTurn", () => {
    endTurn(gameInfo, playersInfo);
  });
});

function endGame(msg) {
  io.sockets.in(room).emit("gameEnded", msg);
  gameFunc.resetGame(gameInfo);
  io.sockets.in(room).emit("resetBoard");
}

function endTurn(gameInfo, playersInfo) {
  if (gameInfo.turnBlue) {
    io.sockets.in(room).emit("notYourTurn", "b", false);
  } else {
    io.sockets.in(room).emit("notYourTurn", "r", false);
  }

  gameInfo.turnBlue ? (gameInfo.turnBlue = false) : (gameInfo.turnBlue = true);
  gameInfo.turnSpy = true;
  gameInfo.turnN++;
  io.sockets.in(room).emit("turnEnded");

  if (gameInfo.turnBlue && gameInfo.turnSpy) {
    io.sockets.in(room).emit("turnBlueSpy", playersInfo.blueSpy.socketID);
    io.sockets.in(room).emit("enterClue", playersInfo.blueSpy.socketID);
  } else if (!gameInfo.turnBlue && gameInfo.turnSpy) {
    io.sockets.in(room).emit("turnRedSpy", playersInfo.redSpy.socketID);
    io.sockets.in(room).emit("enterClue", playersInfo.redSpy.socketID);
  }
}
function setCell(cell, socketID, username) {
  cell.socketID = socketID;
  cell.username = username;
}

function spyExists(spy) {
  return spy.socketID !== null;
}
function setClient(client, team, isSpymaster, yourTurn) {
  client.team = team;
  client.isSpymaster = isSpymaster;
  client.yourTurn = yourTurn;
}
