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

    db = mongoClient.db("ieeevisTweets");
    // Mongo GET tweets
    const tweet = db.collection("tweet");

    // Redis setup
    redisClient = createClient();
    redisClient.on("error", err => console.log("Redis Client Error", err));
    await redisClient.connect();
    // console.log("connected");

    await redisClient.SET("numUsers", "0");
    // In case screen_names set has already been created, remove set
    await redisClient.DEL("screen_names");

    await tweet
      .aggregate([
        {
          $group: {
            _id: "$user.id",
            userInfo: {
              $first: "$user",
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: "$userInfo",
          },
        },
      ])
      .forEach(async function (doc) {
        /* Note: I did not use a promise to SADD to the set because when I did, as 
        it caused the adding to the set and incrementing numUsers to be out of order,\
        and thus would give different wrong answers sometimes.*/
        let res = redisClient.SADD("screen_names", doc.screen_name);
        if (res != "0") {
          await redisClient.INCR("numUsers");
        }
      });

    let numUsers = await redisClient.get("numUsers");
    console.log(`Query 3: Number of distinct users = ${numUsers}`);
  } catch (err) {
    console.log(err);
  } finally {
    await redisClient.quit();
    await mongoClient.close();
  }
};

module.exports = countDistinctUsers();
