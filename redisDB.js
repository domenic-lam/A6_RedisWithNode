async function main() {
  try {
    const query1 = await require("./query1");
    const query2 = await require("./query2");
    const query3 = await require("./query3");
    const query4 = await require("./query4");
    const query5 = await require("./query5");
  } catch (err) {
    console.log(err);
  } finally {
    console.log();
    console.log("Ely (Esther) Lam");
  }
}

main();
