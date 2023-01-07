const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const databasePath = path.join(__dirname, "cricketMatchDetails.db");
let database = null;

const initializeDatabaseAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`database error:${error.message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

//Get players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
SELECT
  player_id as playerId,
  player_name as playerName
FROM
  player_details;`;
  const playerArray = await database.all(getPlayersQuery);
  response.send(playerArray);
});

//Get player API
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      player_id as playerId,
      player_name as playerName
    FROM
      player_details
    WHERE
      player_id=${playerId};`;
  const player = await database.get(getPlayerQuery);
  response.send(player);
});

//Update player details API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
    UPDATE
      player_details
    SET
      player_name='${playerName}'
    WHERE
      player_id=${playerId};`;
  await database.run(updatePlayerQuery);
  console.log(1);
  response.send("Player Details Updated");
});

//Get match details by matchId API
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetails = `
  SELECT
    match_id as matchId,
    match,
    year
  FROM
    match_details
  WHERE
    match_id=${matchId};`;
  const matchDetails = await database.get(getMatchDetails);
  response.send(matchDetails);
});

//Get matches by player
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `
    SELECT
      match_details.match_id as matchId,
      match_details.match as match,
      match_details.year as year
    FROM
      match_details natural join player_match_score
    WHERE
      player_match_score.player_id=${playerId};`;
  const playerMatches = await database.all(getPlayerDetailsQuery);
  console.log(playerMatches);
  response.send(playerMatches);
});

//Get players by match
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getplayersbymatchQuery = `
    SELECT
      player_details.player_id as playerId,
      player_details.player_name as playerName
    FROM
      player_details natural join player_match_score
    WHERE
      player_match_score.match_id=${matchId};`;
  const players = await database.all(getplayersbymatchQuery);
  console.log(players);
  response.send(players);
});

//Get total player scores
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerTotalScoreQuery = `
    SELECT
      player_details.player_id as playerId,
      player_details.player_name as playerName,
      sum(player_match_score.score) as totalScore,
      sum(player_match_score.fours) as totalFours,
      sum(player_match_score.sixes) as totalSixes
    FROM
      player_details natural join player_match_score
    WHERE
      player_match_score.player_id=${playerId};`;
  const playerTotalScores = await database.get(getPlayerTotalScoreQuery);
  response.send(playerTotalScores);
});

module.exports = app;
