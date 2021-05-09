const WIDTH = 5;
var cardOperative = [];
var cardSpymaster = [];
var labels = [];
// var STARTING_TEAM = "r";
// var turn = STARTING_TEAM;
// var redLeft = score[0];
// var blueLeft = score[1];

var game = { STARTING_TEAM: "r", score: { red: 0, blue: 0 }, turn: "r" };

initGame(game);
// Wait until the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Immediately display score
  updateGame(game);
  var gridOperative = document.querySelector(".gridOperative");
  var gridSpymaster = document.querySelector(".gridSpymaster");
  var endTurn = document.querySelector(".end-turn");
  // var turnValue = document.querySelector(".turn>.value");

  createBoard(gridOperative, cardOperative);
  createBoard(gridSpymaster, cardSpymaster);

  labels = generateLabels("r");
  isClosed = [];
  for (let i = 0; i < WIDTH * WIDTH; i++) isClosed.push(true);

  shuffleDeck(labels);

  fillCard(cardSpymaster, labels);
  runGame(game);

  // listens for clicks
  function runGame(game) {
    cardOperative.forEach((card) =>
      card.addEventListener("click", (e) => {
        revealCard(game, card, labels);
      })
    );
    endTurn.addEventListener("click", (e) => {
      game.turn = changeTurn(game.turn);
      updateGame(game);
    });
  }

  // changing turn variable
  function changeTurn(turn) {
    if (turn === "r") {
      turn = "b";
    } else if (turn === "b") {
      turn = "r";
    }
    console.log("turn of " + turn);
    return turn;
  }

  // implements opening of the card and adjusts turn
  function revealCard(game, card, labels) {
    index = card.dataset.id;
    cardValue = labels[index];
    if (cardValue === "r" && isClosed[index]) {
      game.score.red--;
      isClosed[index] = false;
      if (game.turn === "b") {
        game.turn = changeTurn(game.turn);
      }
    } else if (cardValue === "b" && isClosed[index]) {
      game.score.blue--;
      isClosed[index] = false;
      if (game.turn === "r") {
        game.turn = changeTurn(game.turn);
      }
    } else if (cardValue === "a") {
      if (game.turn === "r") {
        alert("Assasin! Game over! Blue won!");
        location.reload();
      } else if (game.turn === "b") {
        alert("Assasin! Game over! Red won!");
        location.reload();
      }
    } else if (isClosed[index]) {
      isClosed[index] = false;
      game.turn = changeTurn(game.turn);
    }
    updateGame(game);
    card.innerText = cardValue;
    if (game.score.red === 0) {
      alert("Red won!");
      location.reload();
    } else if (game.score.blue === 0) {
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

  // fills the card div in the index.html
  function fillCard(cardArray, deck) {
    for (let i = 0; i < cardArray.length; i++) {
      cardArray[i].innerText += deck[i];
    }
  }

  // appends card cells to the board
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

  // randomly shuffles the deck
  function shuffleDeck(deck) {
    // shuffle the cards
    for (let i = deck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i);
      let temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
  }

  // updates the current values of score and turn
  function updateGame(game) {
    document.querySelector(".game-info>.red>.left").innerText = String(game.score.red);
    document.querySelector(".game-info>.blue>.left").innerText = String(
      game.score.blue
    );
    if (game.turn === "r") {
      document.querySelector(".turn>.value").innerText = "Red";
    } else if (game.turn === "b") {
      document.querySelector(".turn>.value").innerText = "Blue";
    }
  }
});

// sets scores at the begining depending on who starts first
function initGame(game) {
  if (game.STARTING_TEAM === "r") {
    game.score.red = 9;
    game.score.blue = 8;
  } else if (game.STARTING_TEAM === "b") {
    game.score.blue = 9;
    game.score.red = 8;
  } else throw "No such team";
}
