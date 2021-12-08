async function main() {
  try {
    const query1 = await require("./queries/query1");
    const query2 = await require("./queries/query2");
    const query3 = await require("./queries/query3");
    // const query4 = await require("./queries/query4");
    const query5 = await require("./queries/query5");
  } catch (err) {
    console.log(err);
  } finally {
    console.log();
    console.log("Ely (Esther) Lam");
  }
}

main();
