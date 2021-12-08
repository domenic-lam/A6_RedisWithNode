/* Query4: (20pts) Create a leaderboard with the top 10 users with more tweets. Use a sorted set called 
leaderboard
*/

const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

let createLeaderboard = async function () {
  let db, mongoClient, redisClient;

  try {
    // Mongo DB setup
    const uri = "mongodb://localhost:27017";
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();

    // Mongo GET tweets
    db = mongoClient.db("ieeevisTweets");
    const tweet = db.collection("tweet");

    // Redis setup
    redisClient = createClient();
    redisClient.on("error", err => console.log("Redis Client Error", err));
    await redisClient.connect();
    // console.log("connected");

    // In case leaderboard sorted set has already been created, remove set
    await redisClient.del("leaderboard");

    // Create a leaderboard with the top 10 users with more tweets
    await tweet.find().forEach(async function (doc) {
      await redisClient.zAdd("leaderboard", [
        { score: "1", value: doc.screen_name },
        { CX: 1 },
      ]);
    });

    await redisClient.zRange("test", "+inf", "-inf", {
      BY: "SCORE",
      REV: true,
    });
    const leaderboard = await redisClient.zRangeWithScores(
      "leaderboard",
      0,
      -1
    );

    console.log(`Leaderboard: ${leaderboard}`);
  } catch (err) {
    console.log(err);
  } finally {
    await redisClient.quit();
    await mongoClient.close();
  }
};

module.exports = createLeaderboard();
