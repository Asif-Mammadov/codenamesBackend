const express = require("express");
var path = require("path");
const Router = express.Router();

const { Utils } = require("../src/Utils");
const { Player, Client } = require("../src/Player");
const { RoleScore } = require("../src/RoleScore");
const { GameInfo } = require("../src/GameInfo");
const { PlayersInfo } = require("../src/PlayersInfo");
const { PlayerScore } = require("../src/PlayerScore");
const { Credential } = require("../src/Credential");

const playerNames = new Map();
const playersInfo = new Map();
const gameInfo = new Map();

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
const randomNames = [
  "player1",
  "player2",
  "player3",
  "player4",
  "player5",
  "player6",
];

const getTmpName = (playerNames, randomNames) => {
  if (playerNames.length > randomNames.length) return null;
  else return randomNames[playerNames.length];
};

const generateString = () => {
  return Math.random().toString(36).substring(7);
};

const roomsId = [];
// const room = "room";
// Very simple example
Router.use("/", (req, res, next) => {
  res.sendFile(path.resolve("views/game/index.html"));
  const io = req.io;
  io.on("connection", (socket) => {
    console.log("New user connected : ", socket.id);
    var room = null;
    socket.on("create", () => {
      let newRoomId = generateString();
      playerNames[newRoomId] = [];
      playersInfo[newRoomId] = new PlayersInfo();
      gameInfo[newRoomId] = new GameInfo();
      console.log("New room ", newRoomId, " is created by ", socket.id);
      roomsId.push(newRoomId);
      socket.emit("room", newRoomId);
    });

    socket.on("join", (room) => {
      var room = room
      let isValid;
      if (!roomsId.includes(room)) {
        isValid = false;
        console.log("Room is not valid : ", room)
      } else {
        isValid = true;
        socket.join(room);
        console.log(socket.id, " joined ", room);
        playerNames[room].push(
          new Player(
            socket.id,
            null,
            new PlayerScore(
              new RoleScore(0, 0, 0, 0),
              new RoleScore(0, 0, 0, 0)
            )
          )
        );
      }
      socket.emit("roomChecked", isValid);
    });

    socket.on("disconnect", () => {
      const { blueOps, redOps, spectators, blueSpy, redSpy } = playersInfo[room];
      const playerIndex = playerNames[room]
        .map((player) => player.socketID)
        .indexOf(socket.id);
      const playerName = playerNames[room][playerIndex].username;
      playerNames[room].splice(playerIndex, 1);
      console.log(playerNames[room]);
      if (playersInfo[room].host.socketID === socket.id) {
        setCell(playersInfo[room].host, null, null);
        for (let i = 0; i < playerNames[room].length; i++) {
          if (playerNames[room][i].username !== null) {
            setCell(
              playersInfo[room].host,
              playerNames[room][i].socketID,
              playerNames[room][i].username
            );
            break;
          }
        }
        if (playersInfo[room].host.socketID === null) {
          console.log("reset game");
          gameInfo[room].reset();
        }
        io.sockets
          .in(room)
          .emit("serverMsg", playersInfo[room].host.socketID, "You are host now!");
      }
      // Consider if the player have been playing not just watching
      if (blueOps.map((i) => i.username).includes(playerName)) {
        const index = blueOps.map((i) => i.username).indexOf(playerName);
        blueOps.splice(index, 1);
      } else if (redOps.map((i) => i.username).includes(playerName)) {
        const index = redOps.map((i) => i.username).indexOf(playerName);
        redOps.splice(index, 1);
      } else if (blueSpy.username === playerName) {
        setCell(blueSpy, null, null);
      } else if (redSpy.username === playerName) {
        setCell(redSpy, null, null);
        console.log("Red spy", redSpy);
      } else {
        const index = spectators.map((i) => i.socketID).indexOf(socket.id);
        spectators.splice(spectators.indexOf(index), 1);
      }
      io.sockets.in(room).emit("updatePlayers", playersInfo[room]);
    });

    socket.on("joinedBlueOps", (client) => {
      const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo[room];
      // if spectator
      if (gameInfo[room].getStarted() && client.team.length !== 0) {
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
      if (blueOps.length >= gameInfo[room].getMaxNOps()) {
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
      io.sockets.in(room).emit("updatePlayers", playersInfo[room]);

      //update
      // setClient(client, "b", false, gameInfo[room].getTurnBlue());
      client = new Client(client.name, "b", false, gameInfo[room].getTurnBlue());
      socket.emit("updateRole", client);
      socket.emit("removeLabels", socket.id);
    });

    socket.on("joinedRedOps", (client) => {
      const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo[room];
      console.log(redOps);
      if (gameInfo[room].getStarted() && client.team.length !== 0) {
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
      if (redOps.length >= gameInfo[room].getMaxNOps()) {
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
      io.sockets.in(room).emit("updatePlayers", playersInfo[room]);
      //update
      // setClient(client, "r", false, !gameInfo[room].getTurnBlue());
      client = new Client(client.name, "r", false, !gameInfo[room].getTurnBlue());
      socket.emit("updateRole", client);
      socket.emit("removeLabels", socket.id);
    });

    socket.on("joinedBlueSpy", (client) => {
      const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo[room];
      if (gameInfo[room].getStarted() && client.team.length !== 0) {
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
        console.log("Occupied");
        socket.emit("alertFromServer", "occupied");
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
      }
      client.isSpymaster = true;
      setCell(blueSpy, socket.id, client.name);
      io.sockets.in(room).emit("updatePlayers", playersInfo[room]);
      //update
      // setClient(client, "b", true, gameInfo[room].getTurnBlue());
      client = new Client(client.name, "b", true, gameInfo[room].getTurnBlue());
      socket.emit("updateRole", client);
      if (gameInfo[room].getStarted()) {
        io.sockets
          .in(room)
          .emit(
            "getLabels",
            playersInfo[room].blueSpy.socketID,
            gameInfo[room].getLabels()
          );
      }
    });

    socket.on("joinedRedSpy", (client) => {
      const { spectators, blueOps, redOps, blueSpy, redSpy } = playersInfo[room];
      if (gameInfo[room].getStarted() && client.team.length !== 0) {
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
        socket.emit("alertFromServer", "occupied");
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
      io.sockets.in(room).emit("updatePlayers", playersInfo[room]);
      //update
      // setClient(client, "r", true, !gameInfo[room].getTurnBlue());
      client = new Client(client.name, "r", true, !gameInfo[room].getTurnBlue());
      socket.emit("updateRole", client);
      if (gameInfo[room].getStarted()) {
        io.sockets
          .in(room)
          .emit(
            "getLabels",
            playersInfo[room].blueSpy.socketID,
            gameInfo[room].getLabels()
          );
      }
    });

    /* Game */
    socket.on("startGame", () => {
      gameInfo[room].reset();
      // check if is host
      if (socket.id !== playersInfo[room].host.socketID) {
        socket.emit("alertFromServer", "Only host can start the game!");
        return;
      }
      if (playersInfo[room].redSpy.socketID === null || playersInfo[room].blueSpy.socketID === null ){
        socket.emit("alertFromServer", "Spymaster is empty!")
        return;
      }
      if(playersInfo[room].blueOps.length === 0 || playersInfo[room].redOps.length === 0){
        socket.emit("alertFromServer", "Operatives are empty!");
        return;
      }
      gameInfo[room].init(wordList);
      io.sockets.in(room).emit("gameStarted", gameInfo[room].getBlueStarts());

      io.sockets
        .in(room)
        .emit("getLabels", playersInfo[room].blueSpy.socketID, gameInfo[room].getLabels());
      io.sockets
        .in(room)
        .emit("getLabels", playersInfo[room].redSpy.socketID, gameInfo[room].getLabels());

      io.sockets.in(room).emit("getBoard", gameInfo[room].getBoard());

      if (gameInfo[room].getTurnBlue() && gameInfo[room].getTurnSpy()) {
        io.sockets.in(room).emit("turnBlueSpy", playersInfo[room].blueSpy.socketID);
        io.sockets.in(room).emit("enterClue", playersInfo[room].blueSpy.socketID);
      } else if (!gameInfo[room].getTurnBlue() && gameInfo[room].getTurnSpy()) {
        io.sockets.in(room).emit("turnRedSpy", playersInfo[room].redSpy.socketID);
        io.sockets.in(room).emit("enterClue", playersInfo[room].redSpy.socketID);
      }
    });

    socket.on("clueEntered", (clueWord, clueNum, username) => {
      gameInfo[room].clues.push(new Clue(clueWord, clueNum, username));
      gameInfo[room].setTurnSpy(false);
      io.sockets.in(room).emit("getClues", gameInfo[room].clues);
      if (gameInfo[room].getTurnBlue()) {
        io.sockets.in(room).emit("chooseCard", "b", false);
      } else {
        io.sockets.in(room).emit("chooseCard", "r", false);
      }
    });

    socket.on("cardChosen", (cardId) => {
      let i = gameInfo[room].getBoard()[cardId].label;
      if (i !== "n") {
        socket.emit("alertFromServer", "already opened");
        return;
      }
      const curLabel = (gameInfo[room].getBoard()[cardId].label =
        gameInfo[room].getLabels()[cardId]);
      io.sockets.in(room).emit("getBoard", gameInfo[room].getBoard());
      if (gameInfo[room].getTurnBlue()) {
        if (curLabel === "b") {
          //give score to op
          let index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room][index].score.Op.right++;

          //give score to spy
          index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(playersInfo[room].blueSpy.socketID);
          playerNames[room][index].score.Spy.right++;

          //decrease score
          gameInfo[room].setBlueScore(gameInfo[room].getBlueScore() - 1);
        } else if (curLabel === "r") {
          //give score to op
          let index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room][index].score.Op.wrong++;

          //give score to spy
          index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(playersInfo[room].blueSpy.socketID);
          playerNames[room][index].score.Spy.wrong++;

          gameInfo[room].setRedScore(gameInfo[room].getRedScore() - 1);
          endTurn(gameInfo[room], playersInfo[room]);
        } else if (curLabel === "i") {
          //give score to op
          let index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room][index].score.Op.i++;

          //give score to spy
          index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(playersInfo[room].blueSpy.socketID);
          playerNames[room][index].score.Spy.i++;

          endTurn(gameInfo[room], playersInfo[room]);
        } else if (curLabel === "a") {
          //give score to op
          let index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room][index].score.Op.i++;

          //give score to spy
          index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(playersInfo[room].blueSpy.socketID);
          playerNames[room][index].score.Spy.i++;

          endGame("Red team won");
        }
      } else {
        if (curLabel === "r") {
          //give score to op
          let index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room][index].score.Op.right++;

          //give score to spy
          index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(playersInfo[room].redSpy.socketID);
          playerNames[room][index].score.Spy.right++;

          //decrease score
          gameInfo[room].setRedScore(gameInfo[room].getRedScore() - 1);
        } else if (curLabel === "b") {
          //give score to op
          let index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room][index].score.Op.wrong++;

          //give score to spy
          index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(playersInfo[room].redSpy.socketID);
          playerNames[room][index].score.Spy.wrong++;

          gameInfo[room].setBlueScore(gameInfo[room].getBlueScore() - 1);
          endTurn(gameInfo[room], playersInfo[room]);
        } else if (curLabel === "i") {
          //give score to op
          let index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room][index].score.Op.i++;

          //give score to spy
          index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(playersInfo[room].redSpy.socketID);
          playerNames[room][index].score.Spy.i++;

          endTurn(gameInfo[room], playersInfo[room]);
        } else if (curLabel === "a") {
          //give score to op
          let index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room][index].score.Op.i++;

          //give score to spy
          index = playerNames
            [room].map((player) => player.socketID)
            .indexOf(playersInfo[room].redSpy.socketID);
          playerNames[room][index].score.Spy.i++;

          endGame("Blue team won");
        }
      }
      let index = playerNames
        [room].map((player) => player.socketID)
        .indexOf(socket.id);
      playerNames[room][index].score.Op.i++;
      if (gameInfo[room].getBlueScore() === 0) endGame("Blue team won");
      else if (gameInfo[room].getRedScore() === 0) endGame("Red team won");
    });
    socket.on("endTurn", () => {
      if (!Utils.playersHere(blueOps, redOps, blueSpy, redSpy)) {
        socket.emit("alertFromServer", "Players are absent");
        return;
      }
      endTurn(gameInfo[room], playersInfo[room]);
    });
    socket.on("resetGame", (client) => {
      if (client.name === playersInfo[room].host.getUsername()) {
        resetGame();
      } else {
        socket.emit("alertFromServer", "Only host can reset the game");
      }
    });

    socket.on("sendNickname", (nickname) => {
      let index = playerNames
        [room].map((player) => player.username)
        .indexOf(nickname);
      if (index !== -1) {
        isValid = false;
      } else {
        isValid = true;
        index = playerNames[room].map((player) => player.socketID).indexOf(socket.id);
        if (index !== -1) {
          playerNames[index].username = nickname;

          const { spectators } = playersInfo[room];
          spectators.push(new Credential(socket.id, nickname));
          if (playersInfo[room].host.username === null) {
            setCell(playersInfo[room].host, socket.id, nickname);
          }
          if (gameInfo[room].getStarted()) {
            socket.emit("getBoard", gameInfo[room].getBoard());
          }
          socket.emit(
            "updateRole",
            new Client(nickname, "", false, false, false)
          );
          io.sockets.in(room).emit("updatePlayers", playersInfo[room]);
        } else {
          console.log("No such user with socketid");
        }
      }
      socket.emit("nicknameChecked", isValid);
    });


    socket.on('exitRoom', (client) => {
      console.log(client.socketID, " exited the room ", client.roomId);
    });
  });

  function endGame(msg) {
    io.sockets.in(room).emit("gameEnded", msg);
    gameInfo[room].reset();
  }
  function resetGame() {
    gameInfo[room].reset();
    io.sockets.in(room).emit("gameResets");
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

});

module.exports = Router;
