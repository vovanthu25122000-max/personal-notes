require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'demo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// static frontend
app.use(express.static(path.join(__dirname, 'public')));

// routes (PHẢI TỒN TẠI FILE)
app.use('/auth', require('./routes/auth'));
app.use('/notes', require('./routes/notes'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// start
app.listen(port, () => {
  console.log("Server running on port " + port);
});