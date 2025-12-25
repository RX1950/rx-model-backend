  "name": "rx-model-backend",
  "version": "1.0.0",
  "description": "Sports Odds Backend",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "node-fetch": "^3.3.2"
  }
}

========================
FILE: index.js
========================
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ODDS_API_KEY;

/* Health Check */
app.get("/", (req, res) => {
  res.json({ status: "RX Model backend running" });
});

/* Live Odds */
app.get("/odds", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=us&markets=h2h,spreads,totals&apiKey=${API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch odds" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

========================
FILE: .env
========================
ODDS_API_KEY="PUT_YOUR_API_KEY_HERE"
