exports.initLabels = (nBlue, nRed, nInnocent, nAssasin) => {
  let a = [];
  for (let i = 0; i < nBlue; i++) a.push("b");
  for (let i = 0; i < nRed; i++) a.push("r");
  for (let i = 0; i < nInnocent; i++) a.push("i");
  for (let i = 0; i < nAssasin; i++) a.push("a");
  return a;
};

// randomly shuffles the deck
exports.shuffleDeck = (deck) => {
  // shuffle the cards
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
};

exports.generateBoard = (wordList) => {
  let list = wordList.slice();
  this.shuffleDeck(list);
  let board = [];
  list.forEach((word) => {
    board.push({ word: word, label: 'none' });
  });
  return board;
};

exports.generateLabels = (blueStarts) => {
  let nInnocent = 7;
  let nAssasin = 1;
  let nBlue = null;
  let nRed = null;
  if(blueStarts){
    nBlue = 9;
    nRed = 8;
  }else {
    nBlue = 8;
    nRed = 9;
  }
  let a = this.initLabels(nBlue, nRed, nInnocent, nAssasin);
  this.shuffleDeck(a);
  return a;
};

exports.initScores = (gameInfo, blueStarts) => {
  if (blueStarts) {
    gameInfo.blueScore = 9;
    gameInfo.redScore = 8;
  } else {
    gameInfo.redScore = 9;
    gameInfo.blueScore = 8;
  }
};

exports.randBool = () => {
  return Math.random() < 0.5;
};

exports.initGame = (gameInfo, wordList) => {
  gameInfo.blueStarts = this.randBool();
  gameInfo.turnBlue = gameInfo.blueStarts;
  gameInfo.turnSpy = true;
  gameInfo.labels = this.generateLabels(gameInfo.blueStarts);
  gameInfo.board = this.generateBoard(wordList);
  this.initScores(gameInfo, true);
};
