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

    db = mongoClient.db("ieeevisTweets");
    // Mongo GET tweets
    const tweet = db.collection("tweet");

    // Redis setup
    redisClient = createClient();
    redisClient.on("error", err => console.log("Redis Client Error", err));
    await redisClient.connect();
    // console.log("connected");

    let numUsers = 0;
    // In case leaderboard sorted set has already been created, remove set
    await redisClient.DEL("leaderboard");
    // console.log(`deleted screen_name: ${deletion}`);

    await tweet
      .aggregate([
        {
          $group: {
            _id: "$user.screen_name",
            numTweets: { $sum: 1 },
          },
        },
        { $sort: { numTweets: -1 } },
      ])
      .forEach(async function (doc) {
        // console.log(`screen_name: ${doc.screen_name}`);
        let res = await redisClient.ZADD("screen_names", doc.screen_name);
        if (res == 0) {
          console.log(`screen_names unsuccessful: ${doc.screen_name}`);
        } else {
          numUsers++;
        }
      });

    console.log(`Number of distinct users: ${numUsers}`);
  } catch (err) {
    console.log(err);
  } finally {
    await redisClient.quit();
    await mongoClient.close();
  }
};

module.exports = createLeaderboard();
