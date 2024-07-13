import express from "express";
import ejs from "ejs";
import mysql from "mysql2/promise"; // Using mysql2 promise-based version
import bcrypt from "bcrypt";

import bodyParser from "body-parser";

const app = express();
const PORT = 8080; // Corrected to use the same port variable consistently
const saltRounds = 10;

// Database connection setup
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "pict123", // It's good practice to use environment variables for sensitive data
  database: "resumebuilder",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Connect to the database
db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Database connected successfully");
    connection.release();
  }
});

// Middleware setup
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); // Adding body-parser middleware

// Routes
app.get("/", (req, res) => {
  res.render("login.ejs");
});
app.get("/login", async (req, res) => {
  res.render("login.ejs");  
});

app.get("/register", async (req, res) => {
  res.render("register.ejs");
});

// Registration endpoint
app.post("/register", async (req, res) => {
  const { email,  password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM userinfo WHERE email = ?", [
      email,
    ]);

    if (rows.length > 0) {
      return res.status(400).send("User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const register_query =
      "INSERT INTO userinfo (email,  password) VALUES (?, ?)";

    db.query(register_query, [email, hashedPassword], (err, results) => {
      if (err) {
        console.error("Problem in registering user", err);
        return res.status(500).send("Internal server error.");
      } else {
         res.render("home.ejs");
        console.log("User is registered");
      }
    });
  } catch (err) {
    console.error("Error registering user:", err.message, err.stack);
    res.status(500).send("Internal server error.");
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user record from database based on email
    const [rows] = await db.query("SELECT * FROM userinfo WHERE email = ?", [email]);

    if (rows.length === 0) {
      // User with the provided email does not exist
      return res.status(404).send("User not found.");
    }

    const user = rows[0];

    // Compare entered password with stored hashed password
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // Passwords match, login successful

      res.render("home.ejs") ; 
      console.log("Login successful");
      
    } else {
      // Passwords do not match, login failed
      console.log("Incorrect password");
      res.status(401).send("Incorrect password.");
    }

  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

app.get("/create" , async(req , res)=>{

  res.render("") ; 

}) ; 

app.get("/saved" , async(req , res)=>{

  res.render("") ; 

}) ; 


app.listen(PORT, () => {
  console.log(`Server is started at port ${PORT}`);
});
