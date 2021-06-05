const generateString = () => {
  return Math.random().toString(36).substring(7);
};
function onCreate(nickname, playerNames, playersInfo, gameInfo, roomsId) {
  const { GameInfo } = require("../src/GameInfo");
  const { PlayersInfo } = require("../src/PlayersInfo");
  let newRoomId = generateString();
  playerNames[newRoomId] = [];
  playersInfo[newRoomId] = new PlayersInfo();
  gameInfo[newRoomId] = new GameInfo();
  // console.log("New room ", newRoomId, " is created by ", socket.id);
  roomsId.push(newRoomId);
  // socket.emit("room", newRoomId);
  console.log("PlayerNames: ", playerNames);
  return nickname;
}

module.exports = {
  onCreate: onCreate,
};
