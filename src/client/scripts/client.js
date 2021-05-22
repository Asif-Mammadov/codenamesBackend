import * as func from "./func.js";
window.onload = function () {
  const socket = io();

  const submitNameBtn = document.querySelector("#name-btn");
  const submitHintBtn = document.querySelector("#hint-btn");
  const blueJoinSpyBtn = document.querySelector("#blue-join-spy");
  const blueJoinOpsBtn = document.querySelector("#blue-join-op");
  const redJoinOpsBtn = document.querySelector("#red-join-op");
  const nameInput = document.querySelector("#name-input");
  const cards = document.querySelectorAll(".card");

  const spectatorList = document.querySelector("#players");
  const blueOpsList = document.querySelector("#blue-players");
  const redOpsList = document.querySelector("#red-players");

  const client = {
    name: "",
    team: "",
    isSpymaster: false,
    yourTurn: false,
    teamJoinCounter: 0,
    isOnATeam: false,
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
    if (client.team === "") {
      // Second argument show which team to choose
      socket.emit("joinedBlueOpsFromSpectator");
    } else if (client.team === "r") {
      if (client.isSpymaster) {
        socket.emit("joinedBlueOpsFromRedSpy");
      } else socket.emit("joinedBlueOpsFromRedOps");
    } else if (client.team === "b") {
      if (client.isSpymaster) {
        socket.emit("joinedBlueOpsFromBlueSpy");
        client.isSpymaster = false;
      }
    }
    client.team = "b";
  });

  // Select red ops
  blueJoinOpsBtn.addEventListener("click", (e) => {
    if (client.name === "") alert("Enter the username first!");
    if (client.team === "") {
      // Second argument show which team to choose
      socket.emit("joinedRedOpsFromSpectator");
    } else if (client.team === "b") {
      if (client.isSpymaster) socket.emit("joinedRedOpsFromBlueSpy");
      else socket.emit("joinedRedOpsFromBlueOps");
    } else if (client.team === "r") {
      if (client.isSpymaster) {
        socket.emit("joinedRedOpsFromRedSpy");
        client.isSpymaster = false;
      }
    }
    client.team = "r";
  });

  submitHintBtn.addEventListener("click", () => {
    socket.emit("hello");
  });

  socket.on("updatePlayers", (playersInfo) => {
    func.updatePlayers(playersInfo.spectators, spectatorList);
    func.updatePlayers(playersInfo.blueOps, blueOpsList);
    func.updatePlayers(playersInfo.redOps, redOpsList);
  });

  socket.on("addNewPlayer", (spectatorName) =>
    func.addNameToDOM(spectatorName, spectatorList)
  );
  socket.on("selectedBlueOps", (bluePlayerName) =>
    func.addNameToDOM(bluePlayerName, blueOpsList)
  );
  socket.on("selectedRedOps", (redPlayerName) =>
    func.addNameToDOM(redPlayerName, redOpsList)
  );

  socket.on("removeBlueOp", (blueOpsName) =>
    func.removePlayerFromDOM(blueOpsName, blueOpsList)
  );
  socket.on("removeRedOp", (redOpsName) =>
    func.removePlayerFromDOM(redOpsName, redOpsList)
  );
  socket.on("removeSpectator", (spectatorName) => {
    console.log(spectatorName);
    func.removePlayerFromDOM(spectatorName, spectatorList);
  });
};
