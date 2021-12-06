const query1 = require("./queries/query1");
const query2 = require("./queries/query2");
const query3 = require("./queries/query3");
const query4 = require("./queries/query4");
const query5 = require("./queries/query5");

async function main() {
  try {
    await query1;
    await query2;
    await query3;
    await query4;
    await query5;
  } catch (err) {
    console.log(err);
  } finally {
    console.log("Ely (Esther) Lam");
  }
}

main();

const { createClient } = require("redis");
async function addTweet(text) {
  let client;
  try {
    client = createClient();
    client.on("error", err => console.log("Redis Client Error", err));
    await client.connect();
    console.log("connected");
    //WHAT'S THE KEY FOR STORING THE USER OF TWEET 7
    const nextId = await client.incr("tweetCount");
    console.log(`nextId ${nextId}`);
    await client.set(`tweet:${nextId}:text`, text);
    console.log(`tweet ${nextId} added`);
    await client.rpush("tweets", `tweet:${nextId}`);
  } finally {
    await client.quit();
  }
}
async function addTweet2(user, text) {
  let client;
  try {
    client = createClient();
    client.on("error", err => console.log("Redis Client Error", err));
    await client.connect();
    console.log("connected");
    const nextId = await client.incr("tweetCount");
    console.log(`nextId ${nextId}`);
    await client.hSet(`tweet:${nextId}`, { user: user, text: text });
    console.log(`tweet ${nextId} added`);
    // await client.rpush("tweets", `tweet:${nextId}`);
  } finally {
    await client.quit();
  }
}
async function addTweetStrings(user, text) {
  let client;
  try {
    client = createClient();
    client.on("error", err => console.log("Redis Client Error", err));
    await client.connect();
    console.log("connected");
    const nextId = await client.incr("tweetCount");
    console.log(`nextId ${nextId}`);
    const tweet = { user: user, text: text };
    await client.hset(`tweet:${nextId}`, JSON.stringify(tweet));
    console.log(`tweet ${nextId} added`);
    // await client.rpush("tweets", `tweet:${nextId}`);
  } finally {
    await client.quit();
  }
}
async function sortedSet() {
  let client;
  try {
    client = createClient();
    client.on("error", err => console.log("Redis Client Error", err));
    await client.connect();
    await client.zAdd("user:0:followers", [
      { score: "1", value: "John" },
      { score: "2", value: "Other John" },
    ]);
    await client.zAdd(
      "user:10:followers",
      { score: "3", value: "Only one" },
      { CX: 1 }
    );
  } finally {
    await client.quit();
  }
}
sortedSet("duto_guerra", "with hashes");
