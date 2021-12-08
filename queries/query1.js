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

    // Mongo GET tweets
    db = mongoClient.db("ieeevisTweets");
    const tweet = db.collection("tweet");

    // Redis setup
    redisClient = createClient();
    await redisClient.connect();

    //initialize tweetCount in 0 (SET)
    await redisClient.set("tweetCount", "0");

    // query the tweets collection in Mongo and increase (INCR) tweetCount
    await tweet.find().forEach(async function () {
      await redisClient.incr("tweetCount");
    });

    // get the last value of tweetCount (GET) and print it in the console
    let tweetCount = await redisClient.get("tweetCount");
    console.log(`Query 1: There were ${tweetCount} tweets`);
  } catch (err) {
    console.log(err);
  } finally {
    await redisClient.quit();
    await mongoClient.close();
  }
};

module.exports = countTweets();
