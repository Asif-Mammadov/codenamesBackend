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

export function displayElement(element) {
  element.classList.remove("hide");
}

export function setText(element, text) {
  element.innerText = text;
}

export function updatePlayers(playerNames, elementLocation) {
  removeAllChildNodes(elementLocation);
  playerNames.map((playerName) => {
    let player = document.createElement("h4");
    let node = document.createTextNode(playerName.username);
    player.appendChild(node);
    elementLocation.appendChild(player);
  });
}
export function removeAllChildNodes(parentNode) {
  parentNode.innerHTML = ""
}

function addClass(element, className) {
  element.classList.add(className);
}
function removeClass(element, className) {
  element.classList.remove(className);
}

export function putLables(cards, labels) {
  console.log(labels);
  for (let i = 0; i < cards.length; i++) {
    if (labels[i] === "b") addClass(cards[i], "card-blue");
    else if (labels[i] === "r") addClass(cards[i], "card-red");
    else if (labels[i] === "i") addClass(cards[i], "card-yellow");
    else if (labels[i] === "a") addClass(cards[i], "card-black");
  }
}

export function fillBoard(cards, boardValues) {
  for (let i = 0; i < cards.length; i++) {
    if (boardValues[i].label === "b") addClass(cards[i], "card-blue");
    else if (boardValues[i].label === "r") addClass(cards[i], "card-red");
    else if (boardValues[i].label === "i")
      addClass(cards[i], "card-yellow");
    else if (boardValues[i].label === "a")
      addClass(cards[i], "card-black");
    setText(cards[i].firstChild, boardValues[i].word);
  }
}
