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

module.exports = (io) => {
  console.log("i am here");
  io.on("connection", (socket) => {
    console.log("New user connected : ", socket.id);
    var room_global = null;
    socket.on("create", (nickname) => {
      let newRoomId = generateString();
      playerNames[newRoomId] = [];
      playersInfo[newRoomId] = new PlayersInfo();
      gameInfo[newRoomId] = new GameInfo();
      console.log("New room ", newRoomId, " is created by ", socket.id);
      roomsId.push(newRoomId);
      socket.emit("room", newRoomId);
      console.log("PlayerNames: ", playerNames);
    });

    socket.on("join", (room, nickname) => {
      let isValid;
      if (!roomsId.includes(room)) {
        isValid = false;
        console.log("Room is not valid : ", room);
        socket.emit("roomChecked", isValid);
      } else if (
        playerNames[room].map((player) => player.username).includes(nickname)
      ) {
        isValid = false;

        console.log("Username is occupied : ", nickname);
        socket.emit("nicknameChecked", isValid);
      } else {
        isValid = true;
        socket.join(room);
        room_global = room;

        console.log(socket.id, " joined ", room);
        playerNames[room].push(
          new Player(
            socket.id,
            nickname,
            new PlayerScore(
              new RoleScore(0, 0, 0, 0),
              new RoleScore(0, 0, 0, 0)
            )
          )
        );
        playersInfo[room_global].spectators.push(
          new Credential(socket.id, nickname)
        );
        socket.emit("nicknameChecked", isValid);
        console.log("Updated player info: ");
        io.sockets
          .in(room_global)
          .emit("updatePlayers", playersInfo[room_global]);
        // io.sockets.in(room_global).emit("updatePlayers2", playersInfo[room_global]);
        console.log("Updated role");
        // make him spectator as default
        socket.emit(
          "updateRole",
          new Client(nickname, "", false, false, false, room_global)
        );
        // socket.emit("updateRole2", new Client(nickname, "", false, false, false, room_global), playersInfo[room_global]);
      }
    });
    socket.on("checkRoom", (roomId) => {
      let isValid;
      if (roomsId.includes(roomId)) {
        isValid = true;
      } else isValid = false;
      socket.emit("roomChecked", isValid);
    });

    socket.on("sendLang", (lang) => {
      console.log("Lang changed to ", lang);
      gameInfo[room_global].setLang(lang);
    });

    socket.on("disconnect", () => {
      if (room_global === null) return;
      const { blueOps, redOps, spectators, blueSpy, redSpy } =
        playersInfo[room_global];
      console.log("spectators: ", spectators);
      const playerIndex = playerNames[room_global]
        .map((player) => player.socketID)
        .indexOf(socket.id);
      const playerName = playerNames[room_global][playerIndex].username;
      playerNames[room_global].splice(playerIndex, 1);
      console.log("Player ", playerName, " disconnected");
      if (playersInfo[room_global].host.socketID === socket.id) {
        setCell(playersInfo[room_global].host, null, null);
        for (let i = 0; i < playerNames[room_global].length; i++) {
          if (playerNames[room_global][i].username !== null) {
            setCell(
              playersInfo[room_global].host,
              playerNames[room_global][i].socketID,
              playerNames[room_global][i].username
            );
            break;
          }
        }
        if (playersInfo[room_global].host.socketID === null) {
          console.log("reset game");
          gameInfo[room_global].reset();
        }
        io.sockets
          .in(room_global)
          .emit(
            "serverMsg",
            playersInfo[room_global].host.socketID,
            "You are host now!"
          );
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
      io.sockets
        .in(room_global)
        .emit("updatePlayers", playersInfo[room_global]);
    });

    socket.on("joinedBlueOps", (client) => {
      const { spectators, blueOps, redOps, blueSpy, redSpy } =
        playersInfo[room_global];
      // if spectator
      if (gameInfo[room_global].getStarted() && client.team.length !== 0) {
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
      if (blueOps.length >= gameInfo[room_global].getMaxNOps()) {
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
      console.log("Update players after blueOps join");
      io.sockets
        .in(room_global)
        .emit("updatePlayers", playersInfo[room_global]);

      //update
      // setClient(client, "b", false, gameInfo[room_global].getTurnBlue());
      client = new Client(
        client.name,
        "b",
        false,
        gameInfo[room_global].getTurnBlue(),
        client.canGuess,
        room_global
      );

      console.log("Update role after blueOps join");
      socket.emit("updateRole", client);
      socket.emit("removeLabels", socket.id);
    });

    socket.on("joinedRedOps", (client) => {
      console.log(client);
      const { spectators, blueOps, redOps, blueSpy, redSpy } =
        playersInfo[room_global];
      console.log(redOps);
      if (gameInfo[room_global].getStarted() && client.team.length !== 0) {
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
      if (redOps.length >= gameInfo[room_global].getMaxNOps()) {
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
      console.log("Update players after redops join");
      io.sockets.in(room_global).emit("updatePlayers", playersInfo[room]);
      //update
      // setClient(client, "r", false, !gameInfo[room_global].getTurnBlue());
      client = new Client(
        client.name,
        "r",
        false,
        !gameInfo[room_global].getTurnBlue(),
        client.canGuess,
        global_room
      );
      console.log("Update role after redops join");
      socket.emit("updateRole", client);
      socket.emit("removeLabels", socket.id);
    });

    socket.on("joinedBlueSpy", (client) => {
      const { spectators, blueOps, redOps, blueSpy, redSpy } =
        playersInfo[room_global];
      if (gameInfo[room_global].getStarted() && client.team.length !== 0) {
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
      console.log("Update players after bluespy join");
      io.sockets.in(room_global).emit("updatePlayers", playersInfo[room]);
      //update
      // setClient(client, "b", true, gameInfo[room_global].getTurnBlue());
      client = new Client(
        client.name,
        "b",
        true,
        gameInfo[room_global].getTurnBlue(),
        cleint.canGuess,
        room_global
      );
      console.log("Update role after bluespy join");
      socket.emit("updateRole", client);
      if (gameInfo[room_global].getStarted()) {
        io.sockets
          .in(room_global)
          .emit(
            "getLabels",
            playersInfo[room_global].blueSpy.socketID,
            gameInfo[room_global].getLabels()
          );
      }
    });

    socket.on("joinedRedSpy", (client) => {
      const { spectators, blueOps, redOps, blueSpy, redSpy } =
        playersInfo[room_global];
      if (gameInfo[room_global].getStarted() && client.team.length !== 0) {
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
      console.log("Update player after redspy join");
      io.sockets.in(room_global).emit("updatePlayers", playersInfo[room]);
      //update
      // setClient(client, "r", true, !gameInfo[room_global].getTurnBlue());
      client = new Client(
        client.name,
        "r",
        true,
        !gameInfo[room_global],
        client.canGuess,
        room_global
      );
      client = new Client(
        client.name,
        "r",
        true,
        !gameInfo[room_global].getTurnBlue()
      );
      console.log("Update role after redSpy join");
      socket.emit("updateRole", client);
      if (gameInfo[room_global].getStarted()) {
        io.sockets
          .in(room_global)
          .emit(
            "getLabels",
            playersInfo[room_global].blueSpy.socketID,
            gameInfo[room_global].getLabels()
          );
      }
    });

    /* Game */
    socket.on("startGame", () => {
      console.log("game starts");
      gameInfo[room_global].reset();
      // check if is host
      if (socket.id !== playersInfo[room_global].host.socketID) {
        socket.emit("alertFromServer", "Only host can start the game!");
        return;
      }
      if (
        playersInfo[room_global].redSpy.socketID === null ||
        playersInfo[room_global].blueSpy.socketID === null
      ) {
        socket.emit("alertFromServer", "Spymaster is empty!");
        return;
      }
      if (
        playersInfo[room_global].blueOps.length === 0 ||
        playersInfo[global_rom].redOps.length === 0
      ) {
        socket.emit("alertFromServer", "Operatives are empty!");
        return;
      }
      gameInfo[room_global].init(wordList);
      io.sockets
        .in(room_global)
        .emit("gameStarted", gameInfo[room_global].getBlueStarts());

      io.sockets
        .in(room_global)
        .emit(
          "getLabels",
          playersInfo[room_global].blueSpy.socketID,
          gameInfo[room_global].getLabels()
        );
      io.sockets
        .in(room_global)
        .emit(
          "getLabels",
          playersInfo[room_global].redSpy.socketID,
          gameInfo[room_global].getLabels()
        );

      io.sockets.in(room_global).emit("getBoard", gameInfo[room].getBoard());

      if (gameInfo[room_global].getTurnBlue() && gameInfo[room].getTurnSpy()) {
        io.sockets
          .in(room_global)
          .emit("turnBlueSpy", playersInfo[room_global].blueSpy.socketID);
        io.sockets
          .in(room_global)
          .emit("enterClue", playersInfo[room_global].blueSpy.socketID);
      } else if (
        !gameInfo[room_global].getTurnBlue() &&
        gameInfo[room].getTurnSpy()
      ) {
        io.sockets
          .in(room_global)
          .emit("turnRedSpy", playersInfo[room_global].redSpy.socketID);
        io.sockets
          .in(room_global)
          .emit("enterClue", playersInfo[room_global_global].redSpy.socketID);
      }
    });

    socket.on("clueEntered", (clueWord, clueNum, username) => {
      console.log("clue entered");
      gameInfo[room_global].clues.push(new Clue(clueWord, clueNum, username));
      gameInfo[room_global].setTurnSpy(false);
      io.sockets.in(room_global).emit("getClues", gameInfo[room].clues);
      if (gameInfo[room_global].getTurnBlue()) {
        io.sockets.in(room_global).emit("chooseCard", "b", false);
      } else {
        io.sockets.in(room_global).emit("chooseCard", "r", false);
      }
    });

    socket.on("cardChosen", (cardId) => {
      let i = gameInfo[room_global].getBoard()[cardId].label;
      if (i !== "n") {
        socket.emit("alertFromServer", "already opened");
        return;
      }
      const curLabel = (gameInfo[room_global].getBoard()[cardId].label =
        gameInfo[room_global].getLabels()[cardId]);
      io.sockets.in(room_global).emit("getBoard", gameInfo[room].getBoard());
      if (gameInfo[room_global].getTurnBlue()) {
        if (curLabel === "b") {
          //give score to op
          let index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room_global][index].score.Op.right++;

          //give score to spy
          index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(playersInfo[room_global].blueSpy.socketID);
          playerNames[room_global][index].score.Spy.right++;

          //decrease score
          gameInfo[room_global].setBlueScore(gameInfo[room].getBlueScore() - 1);
        } else if (curLabel === "r") {
          //give score to op
          let index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room_global][index].score.Op.wrong++;

          //give score to spy
          index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(playersInfo[room_global].blueSpy.socketID);
          playerNames[room_global][index].score.Spy.wrong++;

          gameInfo[room_global].setRedScore(gameInfo[room].getRedScore() - 1);
          endTurn(gameInfo[room_global], playersInfo[room]);
        } else if (curLabel === "i") {
          //give score to op
          let index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room_global][index].score.Op.i++;

          //give score to spy
          index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(playersInfo[room_global].blueSpy.socketID);
          playerNames[room_global][index].score.Spy.i++;

          endTurn(gameInfo[room_global], playersInfo[room]);
        } else if (curLabel === "a") {
          //give score to op
          let index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room_global][index].score.Op.i++;

          //give score to spy
          index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(playersInfo[room_global].blueSpy.socketID);
          playerNames[room_global][index].score.Spy.i++;

          endGame("Red team won");
        }
      } else {
        if (curLabel === "r") {
          //give score to op
          let index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room_global][index].score.Op.right++;

          //give score to spy
          index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(playersInfo[room_global].redSpy.socketID);
          playerNames[room_global][index].score.Spy.right++;

          //decrease score
          gameInfo[room_global].setRedScore(gameInfo[room].getRedScore() - 1);
        } else if (curLabel === "b") {
          //give score to op
          let index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room_global][index].score.Op.wrong++;

          //give score to spy
          index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(playersInfo[room_global].redSpy.socketID);
          playerNames[room_global][index].score.Spy.wrong++;

          gameInfo[room_global].setBlueScore(gameInfo[room].getBlueScore() - 1);
          endTurn(gameInfo[room_global], playersInfo[room]);
        } else if (curLabel === "i") {
          //give score to op
          let index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room_global][index].score.Op.i++;

          //give score to spy
          index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(playersInfo[room_global].redSpy.socketID);
          playerNames[room_global][index].score.Spy.i++;

          endTurn(gameInfo[room_global], playersInfo[room]);
        } else if (curLabel === "a") {
          //give score to op
          let index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(socket.id);
          playerNames[room_global][index].score.Op.i++;

          //give score to spy
          index = playerNames[room_global]
            .map((player) => player.socketID)
            .indexOf(playersInfo[room_global].redSpy.socketID);
          playerNames[room_global][index].score.Spy.i++;

          endGame("Blue team won");
        }
      }
      let index = playerNames[room_global]
        .map((player) => player.socketID)
        .indexOf(socket.id);
      playerNames[room_global][index].score.Op.i++;
      if (gameInfo[room_global].getBlueScore() === 0) endGame("Blue team won");
      else if (gameInfo[room_global].getRedScore() === 0)
        endGame("Red team won");
    });
    socket.on("endTurn", () => {
      if (!Utils.playersHere(blueOps, redOps, blueSpy, redSpy)) {
        socket.emit("alertFromServer", "Players are absent");
        return;
      }
      endTurn(gameInfo[room_global], playersInfo[room]);
    });
    socket.on("resetGame", (client) => {
      if (client.name === playersInfo[room_global].host.getUsername()) {
        resetGame();
      } else {
        socket.emit("alertFromServer", "Only host can reset the game");
      }
    });

    socket.on("sendNickname", (nickname) => {
      console.log(playerNames);
      if (room_global === null) {
        console.log("no room was set");
        return;
      }
      let index = playerNames[room_global]
        .map((player) => player.username)
        .indexOf(nickname);
      if (index !== -1) {
        isValid = false;
      } else {
        isValid = true;
        index = playerNames[room_global]
          .map((player) => player.socketID)
          .indexOf(socket.id);
        console.log("index: ", index);
        if (index !== -1) {
          playerNames[room_global][index].username = nickname;

          const { spectators } = playersInfo[room_global];
          spectators.push(new Credential(socket.id, nickname));
          if (playersInfo[room_global].host.username === null) {
            setCell(playersInfo[room_global].host, socket.id, nickname);
          }
          if (gameInfo[room_global].getStarted()) {
            socket.emit("getBoard", gameInfo[room_global].getBoard());
          }
          socket.emit(
            "updateRole",
            new Client(nickname, "", false, false, false, room_global)
          );
          io.sockets
            .in(room_global)
            .emit("updatePlayers", playersInfo[room_global]);
        } else {
          console.log("No such user with socketid");
        }
      }
      socket.emit("nicknameChecked", isValid);
    });

    socket.on("log", (msg) => {
      socket.emit("updatePlayers", playersInfo[room_global]);
      socket.emit(
        "updateRole",
        new Client("hello", "", false, false, false, room_global)
      );
      // console.log(msg);
      // socket.emit("log2", "FromServer to client")
    });

    socket.on("exitRoom", (client) => {
      if (room_global === null) return;
      const { blueOps, redOps, spectators, blueSpy, redSpy } =
        playersInfo[room_global];
      const playerIndex = playerNames[room_global]
        .map((player) => player.socketID)
        .indexOf(socket.id);
      const playerName = playerNames[room_global][playerIndex].username;
      playerNames[room_global].splice(playerIndex, 1);
      console.log(playerNames[room_global]);
      if (playersInfo[room_global].host.socketID === socket.id) {
        setCell(playersInfo[room_global].host, null, null);
        for (let i = 0; i < playerNames[room_global].length; i++) {
          if (playerNames[room_global][i].username !== null) {
            setCell(
              playersInfo[room_global].host,
              playerNames[room_global][i].socketID,
              playerNames[room_global][i].username
            );
            break;
          }
        }
        if (playersInfo[room_global].host.socketID === null) {
          console.log("reset game");
          gameInfo[room_global].reset();
        }
        io.sockets
          .in(room_global)
          .emit(
            "serverMsg",
            playersInfo[room_global].host.socketID,
            "You are host now!"
          );
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
      io.sockets
        .in(room_global)
        .emit("updatePlayers", playersInfo[room_global]);

      console.log(socket.id, " exited the room ", client.roomId);
    });
  });

  function endGame(msg) {
    io.sockets.in(room_global).emit("gameEnded", msg);
    gameInfo[room_global].reset();
  }
  function resetGame() {
    gameInfo[room_global].reset();
    io.sockets.in(room_global).emit("gameResets");
  }

  function endTurn(gameInfo, playersInfo) {
    if (gameInfo.getTurnBlue()) {
      io.sockets.in(room_global).emit("notYourTurn", "b", false);
    } else {
      io.sockets.in(room_global).emit("notYourTurn", "r", false);
    }

    gameInfo.getTurnBlue()
      ? gameInfo.setTurnBlue(false)
      : gameInfo.setTurnBlue(true);
    gameInfo.setTurnSpy(true);
    gameInfo.turnIncrement();
    io.sockets.in(room_global).emit("turnEnded");

    if (gameInfo.getTurnBlue() && gameInfo.getTurnSpy()) {
      io.sockets
        .in(room_global)
        .emit("turnBlueSpy", playersInfo.blueSpy.socketID);
      io.sockets
        .in(room_global)
        .emit("enterClue", playersInfo.blueSpy.socketID);
    } else if (!gameInfo.getTurnBlue() && gameInfo.getTurnSpy()) {
      io.sockets
        .in(room_global)
        .emit("turnRedSpy", playersInfo.redSpy.socketID);
      io.sockets.in(room_global).emit("enterClue", playersInfo.redSpy.socketID);
    }
  }
  function setCell(cell, socketID, username) {
    cell.socketID = socketID;
    cell.username = username;
  }

  function spyExists(spy) {
    return spy.socketID !== null;
  }
};
