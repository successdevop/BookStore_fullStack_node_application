require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

const database = require("./DB/connect");
const userRouter = require("./Routes/userRouter");

// cors options
const corsOptions = {
  origin: "*",
  credential: true,
  optionSuccessStatus: 200,
};

// middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/user", userRouter);

// app listening port
const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    // database
    await database(process.env.MONGO_URL);
    app.listen(PORT, () => {
      console.log(`Database Connected And Server Running on port : ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
