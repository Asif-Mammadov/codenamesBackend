# Backend of the Codenames platform and game

Codenames is a 2015 card game for 4–8 players designed by Vlaada Chvátil and published by Czech Games Edition. Two teams compete by each having a "spymaster" give one-word clues that can point to multiple words on the board. The other players on the team attempt to guess their team's words while avoiding the words of the other team. 

To learn more: 

[Wikipedia page](https://en.wikipedia.org/wiki/Codenames_(board_game))

[Game Rules](https://czechgames.com/files/rules/codenames-rules-en.pdf)

## Run

Run `npm start` to start the server

Run `npm test` to run tests via Mocha (need to run the server too)

Run `npm ci` to run server and tests 

## Config

To specify the place of your database:

Create new `.env` file in the root folder. Add `DB_USER` as the username, `DB_PASS` as password and `MYSQL_DB` for the name of the database.
