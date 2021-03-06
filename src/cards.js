function getWordsList(lang)
{
  let filename = lang + '.json'
  const words = []
  let dataJson = fs.readFileSync(filename);
  JSON.parse(dataJson).forEach(word => words.push(word))
  
  return getRandomWords(words);
}

function getRandomWords(wordsList, randomWordsCount = 25)
{
  let randomWords = [];
  let foundRandomWords = 0;
  while(foundRandomWords < randomWordsCount)
  {
    const randomIndex = Math.floor(Math.random() * wordsList.length);
    const randomWord = wordsList[randomIndex];
    if(!randomWords.includes(randomWord))
    {
      foundRandomWords++;
      randomWords.push(randomWord);
    }
  }

  return randomWords;
}

module.exports = {
  getRandomWords: getRandomWords,
  getWordsList: getWordsList
}