require('dotenv').config(); 
const express = require('express');
const app = express();
require('ts-node').register();
const Server = require("@igorkowalczyk/repl-uptime");
new Server({
  port: 8080,
  path: "/",
  message: "🤙 Don't let your repl go to sleep!",
  debug: true,
});

const { run } = require('./barnfight');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello BarnFight API !');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

(async () => {
    try {
      await run();
    } catch (error) {
      console.error('Error starting the server:', error);
    }
  })();