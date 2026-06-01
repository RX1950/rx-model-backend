```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// ==========================================
// 📊 SPORTS PROJECTION ENGINE FORMULAS
// ==========================================

const ModelEngine = {
    /**
     * Soccer Projections Formula
     * Custom 4-part framework integrating possession, correlation, scripting, and roles.
     */
    runSoccerProjection: (teamData, playerData) => {
        const { expectedPossession, matchCorrelation, currentMinute, scoreLine } = teamData;
        const { tacticalRole, historicalBaseline } = playerData;
        
        // Strict Filter: Focuses strictly on MIDS/DEFENDERS (CB). Never processes GK or strikers.
        if (tacticalRole === 'GK' || tacticalRole === 'STRIKER') {
            return "FILTERED_POSITION";
        }
        
        let projectionModifier = 1.0;
        
        // 1. The Possession Pivot
        if (expectedPossession > 55 && (tacticalRole === 'CB' || tacticalRole === 'MID')) {
            projectionModifier += 0.15; 
        }
        
        // 2. Game Scripting: The 70th Minute Rule
        if (currentMinute >= 70 && scoreLine === 'draw') {
            projectionModifier -= 0.10; 
        }
        
        // 3. Match-Specific Correlation & Volumetric output
        return (historicalBaseline * projectionModifier * matchCorrelation).toFixed(2);
    },

    /**
     * Tennis Projections Formula
     * Evaluates clay court matchups using WTA and UTR rank gaps to catch line bugs.
     */
    runTennisProjection: (playerA, playerB, courtSurface) => {
        let surfaceFactor = courtSurface === 'clay' ? 1.2 : 1.0;
        const utrDelta = playerA.utr - playerB.utr;
        const rankDelta = playerB.rank - playerA.rank; 
        
        const winProbability = (0.5 + (utrDelta * 0.05) + (rankDelta * 0.002)) * surfaceFactor;
        return Math.min(Math.max(winProbability, 0.05), 0.95).toFixed(2);
    },

    /**
     * CS2 Performance Formula
     * Extracts entry volume pacing and map-specific efficiency metrics.
     */
    runCS2Projection: (playerStats, mapData) => {
        const { avgRating, entryKillRatio } = playerStats;
        const { mapWinRate } = mapData;
        
        const expectedKillVolume = (avgRating * 18.5) * (1 + (entryKillRatio * 0.1)) * (mapWinRate || 1.0);
        return expectedKillVolume.toFixed(1);
    }
};

// ==========================================
// 📡 RENDER API ENDPOINTS
// ==========================================

// Main web route so Render knows our container is alive and listening
app.get('/', (req, res) => {
    res.send('Sports Projection Backend Engine is Live and Running.');
});

// Primary route to feed live matchup calculations
app.post('/api/project', (req, res) => {
    const { sport, teamData, playerData } = req.body;
    
    try {
        let result;
        if (sport === 'soccer') result = ModelEngine.runSoccerProjection(teamData, playerData);
        else if (sport === 'tennis') result = ModelEngine.runTennisProjection(req.body.playerA, req.body.playerB, req.body.surface);
        else if (sport === 'cs2') result = ModelEngine.runCS2Projection(req.body.playerStats, req.body.mapData);
        else return res.status(400).json({ error: 'Unsupported sport selection' });

        res.json({ success: true, projectedLine: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log('Server successfully engaged on port ' + PORT);
});
