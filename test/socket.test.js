var io = require("socket.io-client");
const { assert } = require("assert");
const { expect } = require("chai");
const {
  testSendLogMessage,
  testCreateGame,
  testJoinGame,
} = require("./sockets/interaction.test");
const DEFAULT_ROOM = "000001";
describe("Sockets", function () {
  // var meta = { roomId: 1 };
  var socket = io.connect("http://localhost:4000");

  before((done) => {
    socket.on("connect", done);
  });
  after(() => {
    socket.close();
  });
  describe("Socket test", function () {
    var room = DEFAULT_ROOM;
    var nickname = "alice";

    testSendLogMessage(socket);
    testJoinGame(socket, room, nickname);
  });
});
