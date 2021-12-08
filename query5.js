/* Query5: (30pts) Create a structure that lets you get all the tweets for an specific user. Use lists 
for each screen_name e.g. a list with key tweets:duto_guerra that points to a list of all the tweet ids 
for duto_guerra, e.g. [123, 143, 173, 213]. and then a hash that links from tweetid to the tweet 
information e.g. tweet:123 which points to all the tweet attributes (i.e. user_name, text, created_at, 
etc)
*/

const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

let getUserTweets = async function () {
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

    // console.log("Query 5 test");
    // In case tweets:{screen_name} list has already been created, remove list
    await tweet.find().forEach(async function (doc) {
      await redisClient.del(`tweets:${doc.user.screen_name}`);
      await redisClient.del(`tweet:${doc.id}`);
    });

    // list with key tweets:duto_guerra that points to a list of all the tweet ids for duto_guerra, e.g. [123, 143, 173, 213]
    await tweet.find().forEach(async function (doc) {
      // In case tweets:{screen_name} list has already been created, remove list
      await redisClient.rPush(`tweets:${doc.user.screen_name}`, `${doc.id}`);
    });

    // hash that links from tweetid to the tweet information e.g. tweet:123 which points to all the tweet attributes (i.e. user_name, text, created_at, etc)
    await tweet.find().forEach(async function (doc) {
      await redisClient.hSet(`tweet:${doc.id}`, {
        screen_name: doc.user.screen_name,
        text: doc.text,
        created_at: doc.created_at,
        is_quote_status: doc.is_quote_status,
        source: doc.source,
        retweet_count: doc.retweet_count,
        favorite_count: doc.favorite_count,
      });
    });
  } catch (err) {
    console.log(err);
  } finally {
    await redisClient.quit();
    await mongoClient.close();
  }
};

module.exports = getUserTweets();
