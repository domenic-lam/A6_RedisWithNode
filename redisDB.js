async function main() {
  try {
    await require("./query1");
    await require("./query2");
    await require("./query3");
    await require("./query4");
    await require("./query5");
  } catch (err) {
    console.log(err);
  } finally {
    console.log();
    console.log("Ely (Esther) Lam");
  }
}

main();
