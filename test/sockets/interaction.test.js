const { expect } = require("chai");

const testSendLogMessage = function (socket) {
  it("should send log message", (done) => {
    msg = "hello";
    socket.emit("log", msg);
    socket.on("ack", (ans) => {
      expect(ans).to.equal(msg);
      done();
    });
  });
};

const testJoinGame = function (socket, room, nickname) {
  it("should join the game", (done) => {
    socket.on("updateRole", (client) => {
      expect(client.isHost).to.equal(true);
      console.log(client.isHost);
      client = client;
      done();
    });
    socket.emit("join", room, nickname);
    console.log("ROOM: ", room, ", ", nickname);
  });
};
const testCreateGame = function (socket, nickname) {
  it("should create new room", (done) => {
    socket.on("room", (room) => {
      expect(room !== undefined).to.equal(true);
      expect(room !== "").to.equal(true);
      done();
    });
    socket.emit("create", nickname);
  });
};

module.exports = {
  testSendLogMessage: testSendLogMessage,
  testCreateGame: testCreateGame,
  testJoinGame: testJoinGame,
};
