const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Enable CORS so your GitHub Pages site can talk to it
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

// Root route for health checks
app.get('/', (req, res) => {
    res.send('Model backend engine is live!');
});

// 🎯 THIS IS THE EXACT ENDPOINT YOUR FRONTEND IS CALLING
app.post('/api/project', (req, res) => {
    const { sport, notes } = req.body;
    
    // Default placeholder projection fallback
    let projectedLine = "No line calculated";
    
    if (sport === 'tennis') {
        projectedLine = "OVER 12.5 Games";
    } else if (sport === 'soccer') {
        projectedLine = "OVER 2.5 Shots";
    }
    
    // Send the structured response back to your dashboard
    res.json({ projectedLine: projectedLine });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
