const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: '50mb' }));

// Enable CORS explicitly
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

// Root check route
app.get('/', (req, res) => {
    res.send('Model backend engine is live!');
});

// Primary calculation endpoint
app.post('/api/project', (req, res) => {
    const { sport, notes } = req.body;
    
    let projectedLine = "No line calculated";
    
    if (sport === 'tennis') {
        projectedLine = "OVER 12.5 Games";
    } else if (sport === 'soccer') {
        projectedLine = "OVER 2.5 Shots";
    } else if (sport === 'mlb') {
        projectedLine = "OVER 1.5 Total Bases";
    } else if (sport === 'cs2') {
        projectedLine = "OVER 14.5 Round Kills";
    }
    
    res.json({ projectedLine: projectedLine });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
