import * as utils from "./utils.js";
window.onload = function () {
  var socket = io({ transports: ["websocket"], upgrade: false });

  // const submitNameBtn = document.querySelector("#name-btn");
  const submitClueBtn = document.querySelector("#clue-btn");
  const blueJoinSpyBtn = document.querySelector("#join-blue-spy");
  const blueJoinOpsBtn = document.querySelector("#join-blue-op");
  const redJoinOpsBtn = document.querySelector("#join-red-op");
  const redJoinSpyBtn = document.querySelector("#join-red-spy");
  const startGameBtn = document.querySelector("#start-game");
  const resetGameBtn = document.querySelector("#reset-game")
  const endTurnBtn = document.querySelector("#end-turn");

  const hostNameSpan = document.querySelector("#host-name-span");
  // const nameInput = document.querySelector("#name-input");
  const clueInput = document.querySelector("#input-clue");
  const clueNumInput = document.querySelector("#input-clue-num");
  const turnSpan = document.querySelector("#turn");
  const cards = document.querySelectorAll(".card");

  const gameBoard = document.querySelector("#game-board");
  const clueSection = document.querySelector("#clue");

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

  Array.prototype.forEach.call(cards, (card) => {
    card.addEventListener("click", (e) => {
      if (client.yourTurn && !client.isSpymaster) {
        socket.emit("cardChosen", card.id);
      }
    });
  });
  /* Event listeners */

  // Submit new name
  // submitNameBtn.addEventListener("click", () => {
  //   socket.emit("newPlayerJoined", client, nameInput.value);
  //   // utils.hideElement(submitNameBtn);
  //   // utils.hideElement(nameInput);
  // });

  submitClueBtn.addEventListener("click", () => {
    if (!client.isSpymaster || !client.yourTurn) {
      alert("You are not allowed");
      return;
    } else if (clueInput.value.length === 0) {
      alert("Enter the clue");
      return;
    } else if (
      clueNumInput.value.length === 0 ||
      !utils.isInt(clueNumInput.value)
    ) {
      alert("Enter the digit for clue");
      return;
    }
    socket.emit("clueEntered", clueInput.value, clueNumInput.value);
    client.yourTurn = false;
  });

  resetGameBtn.addEventListener("click", () => {
    socket.emit("resetGame", client);
  })

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

  endTurnBtn.addEventListener("click", (e) => {
    if (client.name === "") alert("Enter the username fisrt!");
    if (client.yourTurn && !client.isSpymaster) {
      client.yourTurn = false;
      socket.emit("endTurn");
    }
  });

  socket.on("updateRole", (newClientInfo) => {
    utils.copyObjectValues(client, newClientInfo);
  });

  socket.on("updatePlayers", (playersInfo) => {
    utils.updatePlayers(playersInfo.spectators, spectatorList);
    utils.updatePlayers(playersInfo.blueOps, blueOpsList);
    utils.updatePlayers(playersInfo.redOps, redOpsList);

    utils.removeAllChildNodes(blueSpyList);
    if (playersInfo.blueSpy.username === null)
      utils.addNameToDOM("", blueSpyList);
    else utils.addNameToDOM(playersInfo.blueSpy.username, blueSpyList);
    utils.removeAllChildNodes(redSpyList);
    if (playersInfo.redSpy.username === null) utils.addNameToDOM("", redSpyList);
    else utils.addNameToDOM(playersInfo.redSpy.username, redSpyList);

    utils.removeAllChildNodes(hostNameSpan);
    utils.addNameToDOM(playersInfo.host.username, hostNameSpan);
  });

  socket.on("updateClient", (newClient) => {
    for (let key in client) {
      client[key] = newClient[key];
    }
  });

  socket.on("alertFromServer", (alertMsg) => alert(alertMsg));

  socket.on("gameStarted", (blueStarts) => {
    blueStarts ? console.log("Blue starts") : console.log("Red starts");
    utils.setText(turnSpan, "Game started");
  });

  // socket.on("yourTurn", () => {
  //   client.yourTurn = true;
  // });

  socket.on("notYourTurn", (team, isSpymaster) => {
    if (client.team === team && client.isSpymaster === isSpymaster) {
      console.log("not your turn");
      client.yourTurn = false;
    }
  });

  socket.on("getLabels", (socketID, labels) => {
    if(socketID == socket.id){
      utils.putLabels(cards, labels);
    }
  });

  socket.on("removeLabels", (socketID) => {
    if (socket.id === socketID) {
      utils.removeLabels(cards);
      client.isSpymaster = false;
    }
  });

  socket.on("getBoard", (boardValues) => {
    utils.displayElement(gameBoard);
    utils.fillBoard(cards, boardValues);
  });

  socket.on("enterClue", (socketID) => {
    if (socketID === socket.id) {
      console.log("enter the clue");
      utils.displayElement(clueSection);
    }
  });

  socket.on("shareClue", (clueWord, clueNum) => {
    alert("Clue: " + clueWord + " : " + clueNum);
    console.log("Clue: " + clueWord + " : " + clueNum);
  });

  socket.on("turnBlueSpy", (socketID) => {
    console.log("Blue Spy turn");
    if (socket.id === socketID) {
      client.yourTurn = true;
    }
  });
  socket.on("turnRedSpy", (socketID) => {
    console.log("Red Spy turn");
    if (socket.id === socketID) {
      client.yourTurn = true;
    }
  });

  socket.on("chooseCard", (team, isSpymaster) => {
    if (client.team === team && client.isSpymaster === isSpymaster) {
      client.yourTurn = true;
      console.log("Choose card");
    }
  });

  socket.on("turnEnded", () => {
    console.log("Turn ended");
  });

  socket.on("serverMsg", (socketID, msg) => {
    if (socket.id === socketID) alert(msg);
  });

  socket.on("gameEnded", (msg) => {
    alert(msg);
    utils.clearBoard(cards);
  });

  socket.on("gameResets", () => {
    utils.clearBoard(cards);
  })

  socket.on("gamePaused", () => {
    alert("Game paused");
  });
};


