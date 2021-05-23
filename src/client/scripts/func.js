export function addNameToDOM(playerName, elementLocation) {
  let name = document.createElement("h4");
  name.textContent = playerName;
  elementLocation.appendChild(name);
}

export function removePlayerFromDOM(playerName, playerList) {
  if (playerList) {
    playerList.querySelectorAll("h4").forEach((element) => {
      console.log(element);
      if (element.textContent === playerName) {
        playerList.removeChild(element);
      }
    });
  }
}

export function hideElement(element) {
  element.classList.add("hide");
}

export function displayElement(element){
  element.classList.remove("hide");
}

export function updatePlayers(playerNames, elementLocation) {
  console.log(playerNames, " ", elementLocation);
  playerNames.map((playerName) => {
    let player = document.createElement("h4");
    let node = document.createTextNode(playerName);
    player.appendChild(node);
    elementLocation.appendChild(player);
  });
}
