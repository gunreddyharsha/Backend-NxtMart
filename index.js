const express = require("express");
const cors = require("cors");
const dotenv=require("dotenv")
dotenv.config()
const jwt = require("jsonwebtoken");
const mongoose=require("mongoose")

const app = express();
app.use(express.json());
app.use(cors());

// --------------------------------------
// 1. Mongoose Connection
// --------------------------------------
let db;
let {DB_PASSWORD,PORT,DB_USER}=process.env
let dbUrl=`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.2hwwh7w.mongodb.net/?appName=Cluster0`

mongoose.connect(dbUrl).then(function(response){
  console.log(" Connection Successful")
}).catch(err=>console.log(err))

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.json({
      status: "400",
      message: "All fields are required"
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        status: "failure",
        message: "User already registered"
      });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.json({
      status: "success",
      message: "Register successful"
    });

  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: err.message
    });
  }
});

// ------------------------------------------------------
// LOGIN API
// ------------------------------------------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      status: "400",
      message: "All fields are required"
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        status: "200",
        message: "No user found"
      });
    }

    if (user.password !== password) {
      return res.json({
        status: "200",
        message: "Password incorrect"
      });
    }

    const token = jwt.sign({ email: user.email }, "my_security_key");

    res.json({
      status: "200",
      message: "Login successful",
      token: token,
      ok: true
    });

  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: err.message
    });
  }
});

app.listen(PORT, () => {
      console.log("Server running at http://localhost:3000/");
    })
