import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ODDS_API_KEY;

app.get("/", (req, res) => {
  res.json({ status: "RX Model backend running" });
});

app.get("/odds", async (req, res) => {
  const { sport } = req.query;
  if (!sport) {
    return res.status(400).json({ error: "sport is required" });
  }

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=us&markets=h2h,spreads,totals&apiKey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch odds" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
