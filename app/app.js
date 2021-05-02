const WIDTH = 5;
var cardOperative = [];
var cardSpymaster = [];
var labels = [];
var STARTING_TEAM = "r";
var score = setScores(STARTING_TEAM, redLeft, blueLeft);
var redLeft = score[0];
var blueLeft = score[1];

// Wait until the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  updateScore(redLeft, blueLeft);
  var gridOperative = document.querySelector(".gridOperative");
  var gridSpymaster = document.querySelector(".gridSpymaster");

  createBoard(gridOperative, cardOperative);
  createBoard(gridSpymaster, cardSpymaster);

  labels = generateLabels("r");
  isClosed = [];
  for (let i = 0; i < WIDTH * WIDTH; i++) isClosed.push(true);

  shuffleDeck(labels);

  fillCard(cardSpymaster, labels);
  runGame();
});

function runGame() {
  cardOperative.forEach((card) =>
    card.addEventListener("click", (e) => {
      revealCard(card, labels);
    })
  );
}

function revealCard(card, labels) {
  index = card.dataset.id;
  cardValue = labels[index];
  console.log(cardValue);
  if (cardValue === "r" && isClosed[index]) {
    console.log("I am here");
    --redLeft;
    isClosed[index] = false;
  } else if (cardValue === "b" && isClosed[index]) {
    --blueLeft;
    isClosed[index] = false;
  } else if(cardValue === 'a'){
    alert("Assasin! Game over!");
  }
  updateScore(redLeft, blueLeft);
  card.innerText = cardValue;
  if(redLeft === 0){
    alert("Red won!");
    location.reload();
  } else if(blueLeft === 0){
    alert("Blue won!");
    location.reload();
  }
  return runGame;
}

// generates the labels for the board
// startingTeam : the team that would go first
// Either 'r' - red or 'b' - blue
function generateLabels(startingTeam) {
  labels = [];
  // add red label
  for (let i = 0; i < 8; i++) labels.push("r");
  // add blue label
  for (let i = 0; i < 8; i++) labels.push("b");
  // add innocents
  for (let i = 0; i < 7; i++) labels.push("i");
  // add assasin
  labels.push("a");
  // add double agent
  if (startingTeam === "b") labels.push("b");
  else if (startingTeam === "r") labels.push("r");
  else throw "No such type of team";
  return labels;
}

function fillCard(cardArray, deck) {
  for (let i = 0; i < cardArray.length; i++) {
    cardArray[i].innerText += deck[i];
  }
}

function createBoard(gridName, cardArray) {
  for (let i = 0; i < WIDTH * WIDTH; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = i;
    cardArray.push(card);
    cell.appendChild(card);
    gridName.appendChild(cell);
  }
}

function shuffleDeck(deck) {
  // shuffle the cards
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
}

function setScores(startingTeam, redLeft, blueLeft) {
  if (startingTeam === "r") {
    redLeft = 9;
    blueLeft = 8;
  } else if (startingTeam === "b") {
    blueLeft = 9;
    redLeft = 8;
  } else throw "No such team";
  return [redLeft, blueLeft];
}

function updateScore(redLeft, blueLeft) {
  document.querySelector(".game-info>.red>.left").innerText = String(redLeft);
  document.querySelector(".game-info>.blue>.left").innerText = String(blueLeft);
}
