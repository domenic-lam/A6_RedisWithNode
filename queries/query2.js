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

    db = mongoClient.db("ieeevisTweets");
    // Mongo GET tweets
    const tweet = db.collection("tweet");

    // Redis setup
    redisClient = createClient();
    redisClient.on("error", err => console.log("Redis Client Error", err));
    await redisClient.connect();
    // console.log("connected");

    await redisClient.set("favoritesSum", "0");
    await tweet
      .aggregate([
        {
          $group: {
            _id: "$id",
            favorite_count: {
              $first: "$favorite_count",
            },
          },
        },
      ])
      .forEach(async function (doc) {
        // console.log(`favorite_count: ${doc.favorite_count}`);
        await redisClient.INCRBY("favoritesSum", parseInt(doc.favorite_count));
        // console.log(`favoritesSum iter: ${favoritesSum}`);
      });

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
