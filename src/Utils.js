const Cell = require("./Cell");
const randBool = () => {
  return Math.random() < 0.5;
};

// randomly shuffles the deck
const shuffleDeck = (deck) => {
  // shuffle the cards
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
};
const initLabels = (nBlue, nRed, nInnocent, nAssasin) => {
  let a = [];
  for (let i = 0; i < nBlue; i++) a.push("b");
  for (let i = 0; i < nRed; i++) a.push("r");
  for (let i = 0; i < nInnocent; i++) a.push("i");
  for (let i = 0; i < nAssasin; i++) a.push("a");
  return a;
};

const generateLabels = (blueStarts) => {
  let nInnocent = 7;
  let nAssasin = 1;
  let nBlue = null;
  let nRed = null;
  if (blueStarts) {
    nBlue = 9;
    nRed = 8;
  } else {
    nBlue = 8;
    nRed = 9;
  }
  let a = initLabels(nBlue, nRed, nInnocent, nAssasin);
  shuffleDeck(a);
  return a;
};

const generateBoard = (wordList) => {
  let list = wordList.slice();
  shuffleDeck(list);
  let board = [];
  list.forEach((word) => {
    board.push({'word': word, 'label': 'n'});
  });
  return board;
};

const playersHere = (blueOps, redOps, blueSpy, redSpy) => {
  if (
    blueOps.length === 0 ||
    redOps.length === 0 ||
    blueSpy.socketID === null ||
    redSpy === null
  )
    return false;
  return true;
};
module.exports = {
  randBool: randBool,
  generateLabels: generateLabels,
  generateBoard: generateBoard,
  playersHere: playersHere,
};
