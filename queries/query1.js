/* Query1: (20pts) How many tweets are there? Create a tweetCount key that contains the total number of
 tweets in the database. For this, initialize tweetCount in 0 (SET), then query the tweets collection in 
 Mongo and increase (INCR) tweetCount. Once the query is done, get the last value of tweetCount (GET) 
 and print it in the console with a message that says "There were ### tweets", with ### being the actual 
 number
*/

const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

let countTweets = async function () {
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

    await redisClient.set("tweetCount", "0");
    let tweetCount = await redisClient.get("tweetCount");

    await tweet.find({}).forEach(function () {
      redisClient.incr("tweetCount");
      tweetCount++;
    });

    console.log(`There were ${tweetCount} tweets`);
    return 0;
  } catch (err) {
    console.log(err);
  } finally {
    await redisClient.quit();
    await mongoClient.close();
  }
};

module.exports = countTweets();
