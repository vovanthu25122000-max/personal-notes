// Main server file for Secure Notes App
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const https = require('https');
const fs = require('fs');

const app = express();
const port = Number(process.env.PORT || 3001);
const certDir = path.join(__dirname, 'cert');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');
const useHttps = String(process.env.USE_HTTPS || 'true').toLowerCase() === 'true'
  && fs.existsSync(keyPath)
  && fs.existsSync(certPath);

const httpsOptions = useHttps
  ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }
  : null;

// MySQL session store config
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'secure_notes'
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { secure: useHttps }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (useHttps) {
  https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`Secure Notes app running at https://localhost:${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`Secure Notes app running at http://localhost:${port}`);
  });
}
