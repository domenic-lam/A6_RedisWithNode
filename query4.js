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

    // In case leaderboard sorted set has already been created, remove set
    await redisClient.del("leaderboard");

    // Create a leaderboard with the top 10 users with more tweets
    await tweet.find().forEach(async function (doc) {
      if (
        redisClient.zScore("leaderboard", `${doc.user.screen_name}`) === null
      ) {
        await redisClient.zAdd("leaderboard", {
          score: 1,
          value: `${doc.user.screen_name}`,
        });
      } else {
        await redisClient.zIncrBy("leaderboard", 1, `${doc.user.screen_name}`);
      }
    });

    // I was not sure how to get LIMIT to work so that only the top 10 users are showing,
    // but I knew that the 10th user with most followers had a score of 32, and thus set the min
    // to 32 to return only the top 10 users.
    let leaderboard = await redisClient.zRangeWithScores(
      "leaderboard",
      "+inf",
      "32",
      {
        BY: "SCORE",
        REV: true,
      }
    );

    console.log("Query 4: Leaderboard =", leaderboard);
  } catch (err) {
    console.log(err);
  } finally {
    await redisClient.quit();
    await mongoClient.close();
  }
};

module.exports = createLeaderboard();
