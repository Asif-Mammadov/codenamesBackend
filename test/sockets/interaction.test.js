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
    let client;
    console.log("ROOM: ", room, ", ", nickname);
    socket.emit("join", room, nickname);
    socket.on("updateRole", (client) => {
      expect(client.isHost).to.equal(true);
      console.log(client.isHost);
      client = client;
      done();
    });

    socket.emit("joinedRedOps", )
  });
};
const testCreateGame = function (socket, nickname) {
  it("should create new room", (done) => {
    socket.emit("create", nickname);
    socket.on("room", (room) => {
      expect(room !== undefined).to.equal(true);
      expect(room !== "").to.equal(true);
      done();
    });
  });
};

module.exports = {
  testSendLogMessage: testSendLogMessage,
  testCreateGame: testCreateGame,
  testJoinGame: testJoinGame,
};
