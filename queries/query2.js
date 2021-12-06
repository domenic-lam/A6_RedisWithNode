/* Query2: (20pts) Compute and print the total number of favorites in the dataset. For this apply the 
same process as before, query all the tweets, start a favoritesSum key (SET), increment it by the number 
of favorites on each tweet (INCRBY), and then get the value (GET) and print it on the screen.
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
