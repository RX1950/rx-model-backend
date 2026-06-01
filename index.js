const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// ==========================================
// 🧠 TEXT PROCESSING & TRUTH CONTROL
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
// 📊 TRUTH-LOCKED PROJECTION MATH MODELS
// ==========================================
const ModelEngine = {
    /**
     * Soccer Projections Formula (Strict Overs Focus)
     */
    runSoccerProjection: (teamData, playerData, rawNotes) => {
        const { expectedPossession, matchCorrelation, currentMinute, scoreLine } = teamData || {};
        const { tacticalRole, historicalBaseline } = playerData || {};
        
        // Strict Overs Filter: GKs, Strikers, and Attackers are strictly banned from processing
        const role = (tacticalRole || '').toUpperCase();
        if (role === 'GK' || role === 'STRIKER' || role === 'ATTACKER' || role === 'ST') {
            return "FILTERED_POSITION_OVERS_ONLY";
        }
        
        const textContext = parseTextContext(rawNotes);
        let possessionValue = expectedPossession || 50;
        if (textContext.isHighPossession) possessionValue = 60;

        let projectionModifier = 1.0;
        
        // The Possession Pivot for Midfielders and Center Backs
        if (possessionValue > 55 && (role === 'CB' || role === 'MID' || role === 'DEFENDER')) {
            projectionModifier += 0.15; 
        }
        
        if (textContext.isAway) {
            projectionModifier += 0.05; 
        }
        
        if (currentMinute >= 70 && scoreLine === 'draw') {
            projectionModifier -= 0.10; 
        }
        
        const baseline = historicalBaseline || 10;
        const correlation = matchCorrelation || 1.0;
        
        return (baseline * projectionModifier * correlation).toFixed(2);
    },

    /**
     * Tennis Projections Formula (PrizePicks Fantasy Score Mode)
     */
    runTennisProjection: (playerA, playerB, rawNotes) => {
        const textContext = parseTextContext(rawNotes);
        const surfaceFactor = textContext.isClay ? 1.15 : 1.0;
        
        const utrA = parseFloat(playerA?.utr) || 8.0;
        const utrB = parseFloat(playerB?.utr) || 8.0;
        const utrDelta = utrA - utrB;
        
        // Establish an objective, unbiased win probability regardless of notes phrasing
        const baseWinProb = 0.5 + (utrDelta * 0.08);
        const winProbability = Math.min(Math.max(baseWinProb, 0.10), 0.90);

        let projectedFantasyScore = 0;

        if (winProbability >= 0.65) {
            // Projected dominant 2-0 match script (e.g., 12 games won, 5 games lost)
            const gamesWon = 12;
            const gamesLost = textContext.isClay ? 6 : 5; // Clay court matches drag slightly longer
            
            projectedFantasyScore = 3 + (2 * 3) + gamesWon - gamesLost + 5; // Includes +5 Clean Sweep Bonus
        } else {
            // Projected close 3-set script or gritty 2-1 matchup script
            const gamesWon = 16;
            const gamesLost = 14;
            
            projectedFantasyScore = 3 + (2 * 3) + gamesWon - gamesLost; // No sweep bonus
        }

        // Apply surface pacing modifier directly to the ultimate prize picks output
        return (projectedFantasyScore * surfaceFactor).toFixed(1);
    },

    /**
     * CS2 Performance Formula (Anti-Bias & Player/Team Disconnect Fix)
     */
    runCS2Projection: (playerStats, mapData, rawNotes) => {
        const textContext = parseTextContext(rawNotes);
        
        // Detect and intercept if the payload accidentally passed a team asset instead of a player profile
        if (!playerStats || playerStats.isTeamAsset || typeof playerStats.avgRating === 'undefined') {
            return "ERROR_EXPECTED_PLAYER_DATA_NOT_TEAM";
        }

        const rating = parseFloat(playerStats.avgRating) || 1.05;
        const entryRatio = parseFloat(playerStats.entryKillRatio) || 1.0;
        const mapWinRate = parseFloat(mapData?.mapWinRate) || 0.50;
        
        let pacingModifier = 1.0;
        if (textContext.isAggressive) pacingModifier += 0.08;

        // Strict baseline volume projection that ignores name-flipping manipulation
        const calculatedKills = (rating * 18.2) * (1 + (entryRatio * 0.08)) * (0.7 + (mapWinRate * 0.6)) * pacingModifier;
        
        // PrizePicks Scoring Calibration for CS2 Maps 1-2 (Kills Volume tracking)
        return calculatedKills.toFixed(1);
    }
};

// ==========================================
// 📡 RENDER API ENDPOINTS
// ==========================================
app.get('/', (req, res) => {
    res.send('Sports Projection Backend Engine is Live and Running.');
});

app.post('/api/project', (req, res) => {
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
