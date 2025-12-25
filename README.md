# RX Model Backend

Node.js backend that securely fetches live sportsbook odds.

## Endpoints

GET /  
Health check

GET /odds  
Live odds  
Query params:
- sport (example: basketball_nba, soccer_epl, americanfootball_nfl)

## Environment Variables

ODDS_API_KEY = your odds API key

## Deployment

Designed for Railway / Node.js hosting.
