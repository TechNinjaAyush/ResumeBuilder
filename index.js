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
  password:  "intel@core77", // It's good practice to use environment variables for sensitive data
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
  res.render("register.ejs");
});

// Registration endpoint
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM userinfo WHERE Email = ?", [email]);

    if (rows.length > 0) {
      return res.status(400).send("User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const register_query = "INSERT INTO userinfo (email, password) VALUES (?, ?)";

    db.query(register_query, [email, hashedPassword], (err, results) => {
      if (err) {
        console.error("Problem in registering user", err);
        return res.status(500).send("Internal server error.");
      } else {
        console.log("User is registered");
      }
    });
  } catch (err) {
    console.error("Error registering user:", err.message, err.stack);
    res.status(500).send("Internal server error.");
  }
});

app.get("/login" , async(req , res)=>{

    res.render("login.ejs") ; 

}) ; 

app.listen(PORT, () => {
  console.log(`Server is started at port ${PORT}`);
});


