import * as func from "./func.js";
window.onload = function () {
  const socket = io();

  const submitNameBtn = document.querySelector("#name-btn");
  const submitClueBtn = document.querySelector("#clue-btn");
  const blueJoinSpyBtn = document.querySelector("#join-blue-spy");
  const blueJoinOpsBtn = document.querySelector("#join-blue-op");
  const redJoinOpsBtn = document.querySelector("#join-red-op");
  const redJoinSpyBtn = document.querySelector("#join-red-spy");
  const startGameBtn = document.querySelector("#start-game");
  const endTurnBtn = document.querySelector("#end-turn");

  const hostNameSpan = document.querySelector("#host-name-span");
  const nameInput = document.querySelector("#name-input");
  const clueInput = document.querySelector("#input-clue");
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
      console.log(client);
      if (client.yourTurn && !client.isSpymaster) {
        console.log(card);
        socket.emit("cardChosen", card.id);
      }
    });
  });
  /* Event listeners */

  // Submit new name
  submitNameBtn.addEventListener("click", () => {
    if(client.name.length > 0){
      alert("You already entered the name");
      return;
    }
    socket.emit("newPlayerJoined", client, nameInput.value);
    // func.hideElement(submitNameBtn);
    // func.hideElement(nameInput);
  });

  submitClueBtn.addEventListener("click", () => {
    if (client.isSpymaster && client.yourTurn) {
      console.log("I am here");
      socket.emit("clueEntered", clueInput.value);
      client.yourTurn = false;
      console.log("Your data: ", client);
    } else {
      alert("You are not allowed");
    }
    console.log("Your data: ", client);
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

  endTurnBtn.addEventListener("click", (e) => {
    if (client.name === "") alert("Enter the username fisrt!");
    if (client.yourTurn && !client.isSpymaster) {
      client.yourTurn = false;
      socket.emit("endTurn");
    }
  });

  socket.on("updateRole", (newClientInfo) => {
    copyObjectValues(client, newClientInfo);
  });

  socket.on("updatePlayers", (playersInfo) => {
    console.log(playersInfo);
    func.updatePlayers(playersInfo.spectators, spectatorList);
    func.updatePlayers(playersInfo.blueOps, blueOpsList);
    func.updatePlayers(playersInfo.redOps, redOpsList);

    func.removeAllChildNodes(blueSpyList);
    if (playersInfo.blueSpy.username === null)
      func.addNameToDOM("", blueSpyList);
    else func.addNameToDOM(playersInfo.blueSpy.username, blueSpyList);
    func.removeAllChildNodes(redSpyList);
    if (playersInfo.redSpy.username === null)
      func.addNameToDOM("", redSpyList);
    else func.addNameToDOM(playersInfo.redSpy.username, redSpyList);

    func.removeAllChildNodes(hostNameSpan);
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

  socket.on("gameStarted", (blueStarts) => {
    blueStarts ? alert("Blue starts") : alert("Red starts");
    func.setText(turnSpan, "Game started");
  });

  socket.on("youSpy", () => {
    client.isSpymaster = true;
  });

  socket.on("youOps", () => {
    client.isSpymaster = false;
  });

  socket.on("youRed", () => {
    client.team = "r";
  });

  socket.on("youBlue", () => {
    client.team = "b";
  });

  socket.on("yourTurn", () => {
    client.yourTurn = true;
  });

  socket.on("notYourTurn", (team, isSpymaster) => {
    if (client.team === team && client.isSpymaster === isSpymaster) {
      alert("not your turn");
      client.yourTurn = false;
    }
  });

  socket.on("getLabels", (socketID, labels) => {
    if (socket.id === socketID) {
      func.putLables(cards, labels);
      client.isSpymaster = true;
    }
  });

  socket.on("getBoard", (boardValues) => {
    func.displayElement(gameBoard);
    func.fillBoard(cards, boardValues);
  });

  socket.on("enterClue", (socketID) => {
    if (socketID === socket.id) {
      alert("enter the clue");
      func.displayElement(clueSection);
    }
  });

  socket.on("shareClue", (clue) => {
    alert("Clue is " + clue);
  });

  socket.on("turnBlueSpy", (socketID) => {
    alert("Blue Spy turn");
    if (socket.id === socketID) {
      client.yourTurn = true;
    }
  });
  socket.on("turnRedSpy", (socketID) => {
    alert("Red Spy turn");
    if (socket.id === socketID) {
      client.yourTurn = true;
    }
  });

  socket.on("chooseCard", (team, isSpymaster) => {
    console.log(client);
    if (client.team === team && client.isSpymaster === isSpymaster) {
      client.yourTurn = true;
      alert("Choose card");
    }
  });

  socket.on("turnEnded", () => {
    alert("Turn ended");
  });

  socket.on("serverMsg", (socketID, msg) => {
    if(socket.id === socketID)
      alert(msg);
  })

  socket.on("gameEnded", msg => {
    alert(msg);
  })
};

function copyObjectValues(dest, src){
  for(var key in src){
    dest[key] = src[key];
  }
}
