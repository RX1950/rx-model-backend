const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// ==========================================
// 🧠 TEXT PARSING UTILITY (REPLACES THE BLIND SPOT)
// ==========================================
const parseTextContext = (text) => {
    if (!text) return {};
    const lower = text.toLowerCase();
    return {
        isClay: lower.includes('clay') || lower.includes('roland garros'),
        isAway: lower.includes('away') || lower.includes('@') || lower.includes('visiting'),
        isHighPossession: lower.includes('high possession') || lower.includes('dominant') || lower.includes('poss'),
        isAggressive: lower.includes('aggressive') || lower.includes('entry') || lower.includes('pacing')
    };
};

// ==========================================
// 📊 SPORTS PROJECTION ENGINE FORMULAS (OVERS BIAS)
// ==========================================
const ModelEngine = {
    /**
     * Soccer Projections Formula
     */
    runSoccerProjection: (teamData, playerData, rawNotes) => {
        const { expectedPossession, matchCorrelation, currentMinute, scoreLine } = teamData || {};
        const { tacticalRole, historicalBaseline } = playerData || {};
        
        // Strict Filter: Strict Overs focus. Never handle GK or Attackers/Strikers.
        const role = (tacticalRole || '').toUpperCase();
        if (role === 'GK' || role === 'STRIKER' || role === 'ATTACKER' || role === 'ST') {
            return "FILTERED_POSITION_OVERS_ONLY";
        }
        
        // Parse the text notes box
        const textContext = parseTextContext(rawNotes);
        let possessionValue = expectedPossession || 50;
        
        // If notes say the team is dominant or high possession, force a high value
        if (textContext.isHighPossession) possessionValue = 60;

        let projectionModifier = 1.0;
        
        // 1. The Possession Pivot (Favors Midfielders & Center Backs)
        if (possessionValue > 55 && (role === 'CB' || role === 'MID' || role === 'DEFENDER')) {
            projectionModifier += 0.15; 
        }
        
        // Adjust baseline if player is playing away from home based on text input
        if (textContext.isAway) {
            projectionModifier += 0.05; // Adjusting for volumetric defensive/midfield output away
        }
        
        // 2. Game Scripting: The 70th Minute Rule
        if (currentMinute >= 70 && scoreLine === 'draw') {
            projectionModifier -= 0.10; 
        }
        
        const baseline = historicalBaseline || 10;
        const correlation = matchCorrelation || 1.0;
        
        return (baseline * projectionModifier * correlation).toFixed(2);
    },

    /**
     * Tennis Projections Formula
     */
    runTennisProjection: (playerA, playerB, rawNotes) => {
        const textContext = parseTextContext(rawNotes);
        
        // Force clay court scaling if explicitly stated in text details
        let surfaceFactor = textContext.isClay ? 1.2 : 1.0;
        
        const utrDelta = (playerA?.utr || 0) - (playerB?.utr || 0);
        const rankDelta = (playerB?.rank || 100) - (playerA?.rank || 100); 
        
        // Strictly optimized to favor high-probability over performance tracks
        const winProbability = (0.5 + (utrDelta * 0.05) + (rankDelta * 0.002)) * surfaceFactor;
        return Math.min(Math.max(winProbability, 0.05), 0.95).toFixed(2);
    },

    /**
     * CS2 Performance Formula
     */
    runCS2Projection: (playerStats, mapData, rawNotes) => {
        const textContext = parseTextContext(rawNotes);
        const { avgRating, entryKillRatio } = playerStats || {};
        const { mapWinRate } = mapData || {};
        
        let pacingModifier = 1.0;
        if (textContext.isAggressive) {
            pacingModifier += 0.12; // Boost baseline volume expectations based on notes
        }
        
        const rating = avgRating || 1.05;
        const entryRatio = entryKillRatio || 1.0;
        const winRate = mapWinRate || 0.50;
        
        const expectedKillVolume = (rating * 18.5) * (1 + (entryRatio * 0.1)) * winRate * pacingModifier;
        return expectedKillVolume.toFixed(1);
    }
};

// ==========================================
// 📡 RENDER API ENDPOINTS
// ==========================================
app.get('/', (req, res) => {
    res.send('Sports Projection Backend Engine is Live and Running.');
});

app.post('/api/project', (req, res) => {
    // Accepting 'notes' directly from the text/details box on your front-end
    const { sport, teamData, playerData, notes, playerA, playerB, playerStats, mapData } = req.body;
    
    try {
        let result;
        if (sport === 'soccer') {
            result = ModelEngine.runSoccerProjection(teamData, playerData, notes);
        } else if (sport === 'tennis') {
            result = ModelEngine.runTennisProjection(playerA, playerB, notes);
        } else if (sport === 'cs2') {
            result = ModelEngine.runCS2Projection(playerStats, mapData, notes);
        } else {
            return res.status(400).json({ error: 'Unsupported sport selection' });
        }

        res.json({ success: true, projectedLine: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log('Server successfully engaged on port ' + PORT);
});
