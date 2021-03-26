const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const path = require("path")

const app = express();

app.use(express.json({ extended:true }));

app.use('/api/auth', require("./routes/auth.routes"));
if (process.env.NODE_ENV === "production") {
    app.use("/", express.static(path.join(__dirname, "client", "build")));

    app.get("*", (req,res)=> {
       res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:3000"],
      optionsSuccessStatus: 200
    })
);

const PORT = config.get('port') || 5000;

async function start() {
  try {
  await mongoose.connect(config.get('mongoUri'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true
  })
    app.listen(PORT, () => console.log(`Server has been started ${PORT}...`))
  } catch (error) {
    console.log(error)
    process.exit(1);
  }
}
start();


