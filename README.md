# Backend of the Codenames platform and game

Codenames is a 2015 card game for 4–8 players designed by Vlaada Chvátil and published by Czech Games Edition. Two teams compete by each having a "spymaster" give one-word clues that can point to multiple words on the board. The other players on the team attempt to guess their team's words while avoiding the words of the other team. 

To learn more: 

[Wikipedia page](https://en.wikipedia.org/wiki/Codenames_(board_game))

[Game Rules](https://czechgames.com/files/rules/codenames-rules-en.pdf)

## Demo
![image](https://user-images.githubusercontent.com/47363118/137690589-25a405e4-496a-443e-829b-7938401ca4e5.png)
![image](https://user-images.githubusercontent.com/47363118/137690667-29e41ea6-78ac-47c5-bb6e-02666cd4d544.png)
![image](https://user-images.githubusercontent.com/47363118/137690803-01cec87c-1b3d-4bb9-b194-34529567f9a8.png)
![image](https://user-images.githubusercontent.com/47363118/137690993-804a5949-62c6-400d-a391-a22c18912b2c.png)
![image](https://user-images.githubusercontent.com/47363118/137691045-c8fe08d3-f857-4077-ab97-9a4e168b97f3.png)
![image](https://user-images.githubusercontent.com/47363118/137691185-cc49f1e1-05f4-400e-b342-f54b04b246c6.png)
![image](https://user-images.githubusercontent.com/47363118/137691662-5248baed-8825-4ff4-8bc3-40a10e41c1d8.png)
![image](https://user-images.githubusercontent.com/47363118/137691690-37cff770-aec2-4858-b0c5-920f9da53cde.png)
![image](https://user-images.githubusercontent.com/47363118/137691735-d985ba47-9a18-4160-8509-199bd4c80ad3.png)
![image](https://user-images.githubusercontent.com/47363118/137691884-4949d248-74f0-449b-9168-873f7b94da7d.png)

## Run

Run `npm start` to start the server

Run `npm test` to run tests via Mocha (need to run the server too)

Run `npm ci` to run server and tests 

## Config

To specify the place of your database:

Create new `.env` file in the root folder. Add `DB_USER` as the username, `DB_PASS` as password and `MYSQL_DB` for the name of the database.
