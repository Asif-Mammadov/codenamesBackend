import * as func from "./func.js";
window.onload = function () {
  const socket = io();

  const submitNameBtn = document.querySelector("#name-btn");
  const submitHintBtn = document.querySelector("#hint-btn");
  const blueJoinSpyBtn = document.querySelector("#join-blue-spy");
  const blueJoinOpsBtn = document.querySelector("#join-blue-op");
  const redJoinOpsBtn = document.querySelector("#join-red-op");
  const redJoinSpyBtn = document.querySelector("#join-red-spy");
  const startGameBtn = document.querySelector("#start-game");

  const hostNameSpan = document.querySelector("#host-name-span");
  const nameInput = document.querySelector("#name-input");
  const turnSpan = document.querySelector("#turn");
  const cards = document.querySelectorAll(".card");
  const gameBoard = document.querySelector("#game-board");

  const spectatorList = document.querySelector("#players");
  const blueOpsList = document.querySelector("#blue-players");
  const redOpsList = document.querySelector("#red-players");
  const blueSpyList = document.querySelector("#blue-spy");
  const redSpyList = document.querySelector("#red-spy");

  const client = {
    name: "",
    team: "",
    isSpymaster: false,
    yourTurn: false,
    canGuess: false,
  };

  /* Event listeners */

  // Submit new name
  submitNameBtn.addEventListener("click", () => {
    socket.emit("newPlayerJoined", nameInput.value);
    client.name = nameInput.value;
    func.hideElement(submitNameBtn);
    func.hideElement(nameInput);
  });

  // Select blue ops
  blueJoinOpsBtn.addEventListener("click", (e) => {
    if (client.name === "") alert("Enter the username first!");
    else socket.emit("joinedBlueOps", client);
  });

  // Select red ops
  redJoinOpsBtn.addEventListener("click", (e) => {
    if (client.name === "") alert("Enter the username first!");
    else socket.emit("joinedRedOps", client);
  });

  blueJoinSpyBtn.addEventListener("click", (e) => {
    if (client.name === "") alert("Enter the username first!");
    else socket.emit("joinedBlueSpy", client);
  });
  redJoinSpyBtn.addEventListener("click", (e) => {
    if (client.name === "") alert("Enter the username first!");
    else socket.emit("joinedRedSpy", client);
  });

  startGameBtn.addEventListener("click", (e) => {
    if (client.name === "") alert("Enter the username fisrt!");
    else socket.emit("startGame");
  });

  socket.on("updatePlayers", (playersInfo) => {
    func.updatePlayers(playersInfo.spectators, spectatorList);
    func.updatePlayers(playersInfo.blueOps, blueOpsList);
    func.updatePlayers(playersInfo.redOps, redOpsList);
    if (playersInfo.blueSpy.username !== null)
      func.addNameToDOM(playersInfo.blueSpy.username, blueSpyList);
    if (playersInfo.redSpy.username !== null)
      func.addNameToDOM(playersInfo.redSpy.username, redSpyList);
    func.addNameToDOM(playersInfo.host.username, hostNameSpan);
  });

  socket.on("addNewPlayer", (spectatorName) =>
    func.addNameToDOM(spectatorName, spectatorList)
  );
  socket.on("addBlueOps", (bluePlayerName) =>
    func.addNameToDOM(bluePlayerName, blueOpsList)
  );
  socket.on("addRedOps", (redPlayerName) =>
    func.addNameToDOM(redPlayerName, redOpsList)
  );

  socket.on("addBlueSpy", (blueSpyName) =>
    func.addNameToDOM(blueSpyName, blueSpyList)
  );
  socket.on("addRedSpy", (redSpyName) =>
    func.addNameToDOM(redSpyName, redSpyList)
  );

  socket.on("removeBlueOps", (blueOpsName) =>
    func.removePlayerFromDOM(blueOpsName, blueOpsList)
  );
  socket.on("removeRedOps", (redOpsName) =>
    func.removePlayerFromDOM(redOpsName, redOpsList)
  );
  socket.on("removeSpectator", (spectatorName) => {
    console.log(spectatorName);
    func.removePlayerFromDOM(spectatorName, spectatorList);
  });

  socket.on("removeBlueSpy", (blueSpyName) => {
    func.removePlayerFromDOM(blueSpyName, blueSpyList);
  });
  socket.on("removeRedSpy", (redSpyName) =>
    func.removePlayerFromDOM(redSpyName, redSpyList)
  );
  socket.on("updateClient", (newClient) => {
    for (let key in client) {
      client[key] = newClient[key];
    }
  });

  socket.on("alertFromServer", (alertMsg) => alert(alertMsg));

  socket.on("addNewHost", (hostName) => {
    func.addNameToDOM(hostName, hostNameSpan);
  });
  socket.on("removeHost", (hostName) => {
    func.removePlayerFromDOM(hostName, hostNameSpan);
  });

  socket.on("gameStarted", () => {
    func.setText(turnSpan, "Game started"); 
  });

  socket.on("getLabels", (labels) => {
    func.putLables(cards, labels);
  });

  socket.on("getBoard", (boardValues) => {
    func.displayElement(gameBoard);
    func.fillBoard(cards, boardValues);
  })

};
