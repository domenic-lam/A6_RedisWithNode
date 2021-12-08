/* Query2: (20pts) Compute and print the total number of favorites in the dataset. For this apply the 
same process as before, query all the tweets, start a favoritesSum key (SET), increment it by the number 
of favorites on each tweet (INCRBY), and then get the value (GET) and print it on the screen.
*/

const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

let countFavorites = async function () {
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

    // start a favoritesSum key (SET)
    await redisClient.set("favoritesSum", "0");

    // increment it by the number of favorites on each tweet (INCRBY)
    await tweet.find().forEach(async function (doc) {
      await redisClient.incrBy("favoritesSum", parseInt(doc.favorite_count));
    });

    // get the value (GET) and print it on the screen
    let favoritesSum = parseInt(await redisClient.get("favoritesSum"));
    console.log(`Query 2: favoritesSum = ${favoritesSum}`);
  } catch (err) {
    console.log(err);
  } finally {
    await redisClient.quit();
    await mongoClient.close();
  }
};

module.exports = countFavorites();
