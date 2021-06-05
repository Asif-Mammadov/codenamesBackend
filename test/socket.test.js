// with { "type": "module" } in your package.json
// import { createServer } from "http";
// import { io as Client } from "socket.io-client";
// import { Server } from "socket.io";
// import { assert } from "chai";

// with { "type": "commonjs" } in your package.json
const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const assert = require("chai").assert;
const { onCreate } = require("../routes/create");

describe("my awesome project", () => {
  let io, serverSocket, clientSocket;

  before((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  after(() => {
    io.close();
    clientSocket.close();
  });

  // it("should work", (done) => {
  //   clientSocket.on("hello", (arg) => {
  //     assert.equal(arg, "world");
  //     done();
  //   });
  //   serverSocket.emit("hello", "world");
  // });

  it("should work (with ack)", (done) => {
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
    const roomsId = []
    nickname = onCreate("nick", playerNames, playersInfo, gameInfo, roomsId);
    assert.equal(nickname, "snick");
    done();
    // serverSocket.on("create", (nickname) => {
    //   assert.equal(nickname, "Nick");
    //   onCreate(nickname);
    // });
    // clientSocket.emit("create", "Nick");
  });
});
