const express = require("express");
const path = require("path");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const winston = require("winston");

const app = express();
const PORT = process.env.PORT || 5006;
const JWT_SECRET = "my-simple-secret-key";

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "security.log" })
  ]
});

app.use(helmet());
app.use(express.urlencoded({ extended: true }));

let users = [];

function escapeHTML(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

app.get("/", (req, res) => {
  res.send(`
    <h1>User Management System</h1>
    <p>This is a simple mock web app for cybersecurity testing.</p>

    <ul>
      <li><a href="/signup">Signup</a></li>
      <li><a href="/login">Login</a></li>
      <li><a href="/profile">Profile</a></li>
      <li><a href="/users">View Stored Users</a></li>
    </ul>
  `);
});

app.get("/signup", (req, res) => {
  res.send(`
    <h2>Signup</h2>
    <form method="POST" action="/signup">
      <label>Name:</label><br>
      <input type="text" name="name" placeholder="Enter name"><br><br>

      <label>Email:</label><br>
      <input type="text" name="email" placeholder="Enter email"><br><br>

      <label>Password:</label><br>
      <input type="text" name="password" placeholder="Enter password"><br><br>

      <button type="submit">Sign Up</button>
    </form>

    <br>
    <a href="/">Back to Home</a>
  `);
});

app.post("/signup", async (req, res) => {

  let { name, email, password } = req.body;              //changes

  name = String(name || "").trim();
  email = String(email || "").trim();
  password = String(password || "").trim();

  if (!name || !email || !password) {
  return res.send("All fields are required");
  }

  if (!validator.isEmail(email)) {
  logger.warn("Invalid signup attempt with email: " + email);
  return res.send("Invalid email format");
  }

  if (password.length < 6) {
  return res.send("Password must be at least 6 characters");
  }

const hashedPassword = await bcrypt.hash(password, 10);

users.push({
  name,
  email,
  password: hashedPassword
  });
  logger.info("New user signed up: " + email);

  res.send(`
    <h2>Signup Successful</h2>
    <p><strong>Name:</strong> ${escapeHTML(name)}</p>
    <p><strong>Email:</strong> ${escapeHTML(email)}</p>
    <p>Password stored securely using hashing.</p>

    <p>User has been stored successfully.</p>

    <a href="/profile">Go to Profile</a><br><br>
    <a href="/">Back to Home</a>
  `);
});

app.get("/login", (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/login">
      <label>Email:</label><br>
      <input type="text" name="email" placeholder="Enter email"><br><br>

      <label>Password:</label><br>
      <input type="text" name="password" placeholder="Enter password"><br><br>

      <button type="submit">Login</button>
    </form>

    <br>
    <a href="/">Back to Home</a>
  `);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user) {
  logger.warn("Login failed. User not found: " + email);
  return res.send(`
    <h2>Login Failed</h2>
    <p>User not found</p>
    <a href="/login">Try Again</a>
  `);
}

  const match = await bcrypt.compare(password, user.password);

  if (match) {
    const token = jwt.sign(
      { email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.send(`
      <h2>Login Successful</h2>
      <p>Welcome ${escapeHTML(user.name)}</p>
      <p><strong>JWT Token:</strong></p>
      <textarea rows="6" cols="60">${escapeHTML(token)}</textarea><br><br>
      <a href="/">Back to Home</a>
    `);
  } else {
    logger.warn("Login failed. Incorrect password for: " + email);
    res.send(`
    <h2>Login Failed</h2>
    <p>Incorrect password</p>
    <a href="/login">Try Again</a>
  `);
  }
});

app.get("/profile", (req, res) => {
  if (users.length === 0) {
    return res.send(`
      <h2>No Users Found</h2>
      <p>Please sign up first.</p>
      <a href="/signup">Go to Signup</a><br><br>
      <a href="/">Back to Home</a>
    `);
  }

  const latestUser = users[users.length - 1];

  res.send(`
    <h2>User Profile</h2>
    <p><strong>Name:</strong> ${escapeHTML(latestUser.name)}</p>
    <p><strong>Email:</strong> ${escapeHTML(latestUser.email)}</p>

    <a href="/">Back to Home</a>
  `);
});

app.get("/users", (req, res) => {
  if (users.length === 0) {
    return res.send(`
      <h2>No Stored Users</h2>
      <a href="/">Back to Home</a>
    `);
  }

  const userList = users
    .map(
      (user, index) => `
        <div style="margin-bottom: 15px;">
          <p><strong>User ${index + 1}</strong></p>
          <p>Name: ${escapeHTML(user.name)}</p>
          <p>Email: ${escapeHTML(user.email)}</p>
          <p>Password: ${escapeHTML(user.password)}</p>
        </div>
        <hr>
      `
    )
    .join("");

  res.send(`
    <h2>Stored Users</h2>
    ${userList}
    <a href="/">Back to Home</a>
  `);
});

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
  logger.info("Application started");
});