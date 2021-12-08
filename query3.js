/* Query3: (20pts) Compute how many distinct users are there in the dataset. For this use a set by the 
screen_name, e.g. screen_names
*/

const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

let countDistinctUsers = async function () {
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
    await redisClient.connect();

    // In case screen_names set has already been created, remove set
    await redisClient.del("screen_names");

    // use a set by the screen_name, e.g. screen_names
    await tweet.find().forEach(async function (doc) {
      await redisClient.sAdd("screen_names", doc.user.screen_name);
    });

    // Compute how many distinct users are there in the dataset
    let numUsers = await redisClient.sCard("screen_names");
    console.log(`Query 3: Number of distinct users = ${numUsers}`);
  } catch (err) {
    console.log(err);
  } finally {
    await redisClient.quit();
    await mongoClient.close();
  }
};

module.exports = countDistinctUsers();
