const express = require("express");
var path = require("path");
const Router = express.Router();

const gameFunc = require("../src/Game");
const { Player } = require("../src/Player");
const { RoleScore } = require("../src/RoleScore");
const { GameInfo, resetGame } = require("../src/GameInfo");
const { PlayersInfo } = require("../src/PlayersInfo");
const { PlayerScore } = require("../src/PlayerScore");

const playerNames = [];
const playersInfo = new PlayersInfo();
const gameInfo = new GameInfo();

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
// Very simple example
Router.use("/", (req, res, next) => {
  res.sendFile(path.resolve("views/game/index.html"));
  const io = req.io;
  io.on("connection", (socket) => {
    console.log(socket.id);
    socket.join(room);
    playerNames.push(
      new Player(
        socket.id,
        null,
        new PlayerScore(new RoleScore(0, 0, 0, 0), new RoleScore(0, 0, 0, 0))
      )
    );
    socket.emit("updatePlayers", playersInfo);
    if (gameInfo.getStarted()) {
      socket.emit("getBoard", gameInfo.getBoard());
    }
    socket.on("newPlayerJoined", (client, name) => {
      let index = playerNames
        .map((player) => player.socketID)
        .indexOf(socket.id);
      if (index >= 0) {
        if (playerNames[index].username !== null) {
          socket.emit("alertFromServer", "You already entered the name");
          return;
        }
      } else if (playerNames.map((player) => player.username).includes(name)) {
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
          console.log(gameInfo);
          gameInfo.reset();
          console.log(gameInfo);
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
      io.sockets.in(room).emit("updatePlayers", playersInfo);
    });

    socket.on("joinedBlueOps", (client) => {
      const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo;
      // if spectator
      if (gameInfo.getStarted() && client.team.length !== 0) {
        socket.emit("alertFromServer", "Game already started");
        return;
      }
      if (
        client.name === "" ||
        blueOps.map((i) => i.username).includes(client.name)
      ) {
        console.log("Player already in list");
        return;
      }
      if (blueOps.length >= gameInfo.getMaxNOps()) {
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
      setClient(client, "b", false, gameInfo.getTurnBlue());
      socket.emit("updateRole", client);
      socket.emit("removeLabels", socket.id);
    });

    socket.on("joinedRedOps", (client) => {
      const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo;
      console.log(redOps);
      if (gameInfo.getStarted() && client.team.length !== 0) {
        socket.emit("alertFromServer", "Game already started");
        return;
      }
      // if spectator
      if (
        client.name === "" ||
        redOps.map((i) => i.username).includes(client.name)
      ) {
        console.log("Player already in list");
        return;
      }
      if (redOps.length >= gameInfo.getMaxNOps()) {
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
      setClient(client, "r", false, !gameInfo.getTurnBlue());
      socket.emit("updateRole", client);
      socket.emit("removeLabels", socket.id);
    });

    socket.on("joinedBlueSpy", (client) => {
      const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo;
      if (gameInfo.getStarted() && client.team.length !== 0) {
        socket.emit("alertFromServer", "Game already started");
        return;
      }
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
      setClient(client, "b", true, gameInfo.getTurnBlue());
      socket.emit("updateRole", client);
      if (gameInfo.getStarted()) {
        io.sockets
          .in(room)
          .emit(
            "getLabels",
            playersInfo.blueSpy.socketID,
            gameInfo.getLabels()
          );
      }
    });

    socket.on("joinedRedSpy", (client) => {
      const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo;
      if (gameInfo.getStarted() && client.team.length !== 0) {
        socket.emit("alertFromServer", "Game already started");
        return;
      }
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
        client.team = "r";
        const index = spectators.map((i) => i.username).indexOf(client.name);
        spectators.splice(index, 1);
      } else if (client.team === "b") {
        client.team = "r";
        if (client.isSpymaster) {
          setCell(blueSpy, null, null);
        } else {
          const index = blueOps.map((i) => i.username).indexOf(client.name);
          blueOps.splice(index, 1);
        }
      } else if (client.team === "r" && !client.isSpymaster) {
        const index = redOps.map((i) => i.username).indexOf(client.name);
        redOps.splice(index, 1);
      }
      client.isSpymaster = true;
      setCell(redSpy, socket.id, client.name);
      io.sockets.in(room).emit("updatePlayers", playersInfo);
      //update
      setClient(client, "r", true, !gameInfo.getTurnBlue());
      socket.emit("updateRole", client);
      if (gameInfo.getStarted()) {
        io.sockets
          .in(room)
          .emit(
            "getLabels",
            playersInfo.blueSpy.socketID,
            gameInfo.getLabels()
          );
      }
    });

    /* Game */
    socket.on("startGame", () => {
      gameInfo.reset();
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
      gameInfo.init(wordList);
      io.sockets.in(room).emit("gameStarted", gameInfo.getBlueStarts());

      io.sockets
        .in(room)
        .emit("getLabels", playersInfo.blueSpy.socketID, gameInfo.getLabels());
      io.sockets
        .in(room)
        .emit("getLabels", playersInfo.redSpy.socketID, gameInfo.getLabels());

      io.sockets.in(room).emit("getBoard", gameInfo.getBoard());

      if (gameInfo.getTurnBlue() && gameInfo.getTurnSpy()) {
        io.sockets.in(room).emit("turnBlueSpy", playersInfo.blueSpy.socketID);
        io.sockets.in(room).emit("enterClue", playersInfo.blueSpy.socketID);
      } else if (!gameInfo.getTurnBlue() && gameInfo.getTurnSpy()) {
        io.sockets.in(room).emit("turnRedSpy", playersInfo.redSpy.socketID);
        io.sockets.in(room).emit("enterClue", playersInfo.redSpy.socketID);
      }
    });

    socket.on("clueEntered", (clueWord, clueNum) => {
      gameInfo.setTurnSpy(false);
      io.sockets.in(room).emit("shareClue", clueWord, clueNum);
      if (gameInfo.getTurnBlue()) {
        io.sockets.in(room).emit("chooseCard", "b", false);
      } else {
        io.sockets.in(room).emit("chooseCard", "r", false);
      }
    });

    socket.on("cardChosen", (cardId) => {
      let i = gameInfo.getBoard()[cardId].label;
      if (i !== "n") {
        socket.emit("alertFromServer", "already opened");
        return;
      }
      const curLabel = (gameInfo.getBoard()[cardId].label =
        gameInfo.getLabels()[cardId]);
      io.sockets.in(room).emit("getBoard", gameInfo.getBoard());
      if (gameInfo.getTurnBlue()) {
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
          gameInfo.setBlueScore(gameInfo.getBlueScore() - 1);
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

          gameInfo.setRedScore(gameInfo.getRedScore() - 1);
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
        } else if (curLabel === "a") {
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
          gameInfo.setRedScore(gameInfo.getRedScore() - 1);
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

          gameInfo.setBlueScore(gameInfo.getBlueScore() - 1);
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
        } else if (curLabel === "a") {
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
      let index = playerNames
        .map((player) => player.socketID)
        .indexOf(socket.id);
      playerNames[index].score.Op.i++;
      if (gameInfo.getBlueScore() === 0) endGame("Blue team won");
      else if (gameInfo.getRedScore() === 0) endGame("Red team won");
    });
    socket.on("endTurn", () => {
      if (!gameFunc.playersHere(blueOps, redOps, blueSpy, redSpy)) {
        socket.emit("alertFromServer", "Players are absent");
        return;
      }
      endTurn(gameInfo, playersInfo);
    });
  });
  function endGame(msg) {
    io.sockets.in(room).emit("gameEnded", msg);
    gameInfo.reset();
  }

  function endTurn(gameInfo, playersInfo) {
    if (gameInfo.getTurnBlue()) {
      io.sockets.in(room).emit("notYourTurn", "b", false);
    } else {
      io.sockets.in(room).emit("notYourTurn", "r", false);
    }

    gameInfo.getTurnBlue()
      ? gameInfo.setTurnBlue(false)
      : gameInfo.setTurnBlue(true);
    gameInfo.setTurnSpy(true);
    gameInfo.turnIncrement();
    io.sockets.in(room).emit("turnEnded");

    if (gameInfo.getTurnBlue() && gameInfo.getTurnSpy()) {
      io.sockets.in(room).emit("turnBlueSpy", playersInfo.blueSpy.socketID);
      io.sockets.in(room).emit("enterClue", playersInfo.blueSpy.socketID);
    } else if (!gameInfo.getTurnBlue() && gameInfo.getTurnSpy()) {
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
});

module.exports = Router;
