require("dotenv").config({ path: "./.env" });
const { default: mongoose } = require("mongoose");
const app = require("./app");

mongoose
  .connect(process.env.LOCAL_MONGO)
  .then(() => console.log("connected succefully"))
  .catch((err) => console.log("fali to connect there is some error", err));

const prot = 3000;
app.listen(prot, () => console.log(`app working on prot ${prot}`));
