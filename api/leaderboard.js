const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const fs = require('fs');
const app = express();

// Database configuration and initialization
const DB_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    connectionTimeout: 5000, // 5 seconds
};

// Initialize Supabase client with error handling
let supabase;
try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false
        },
        db: {
            schema: 'public'
        }
    });
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    process.exit(1);
}

// Enable CORS for all routes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    next();
});

// Database helper functions
async function retryOperation(operation, maxRetries = DB_CONFIG.maxRetries) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, DB_CONFIG.retryDelay));
            }
        }
    }
    throw lastError;
}

// Validate leaderboard entry
function validateLeaderboardEntry(entry) {
    const requiredFields = ['team', 'model', 'fullContext', 'goldEvidence'];
    const missingFields = requiredFields.filter(field => !entry[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    if (typeof entry.fullContext !== 'number' || typeof entry.goldEvidence !== 'number') {
        throw new Error('fullContext and goldEvidence must be numbers');
    }
    
    return true;
}

// Load leaderboard data from Supabase with improved error handling
async function loadData() {
    try {
        const { data, error } = await retryOperation(async () => {
            return await supabase
                .from('leaderboard')
                .select('*')
                .order('fullContext', { ascending: false });
        });

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        // Filter and validate entries
        return (data || [])
            .filter(entry => {
                try {
                    return validateLeaderboardEntry(entry);
                } catch (error) {
                    console.warn(`Invalid entry skipped: ${error.message}`);
                    return false;
                }
            })
            .map(entry => ({
                ...entry,
                delta: entry.goldEvidence - entry.fullContext
            }));
    } catch (error) {
        console.error('Error loading leaderboard data:', error);
        throw new Error('Failed to load leaderboard data');
    }
}

// Load ground truth once at startup
const groundTruth = {}; // { id: label }
try {
    const gtData = JSON.parse(fs.readFileSync('ground_truth.json', 'utf8'));
    gtData.forEach(row => {
        groundTruth[row.id] = row.label;
    });
} catch (error) {
    console.error('Error loading ground truth:', error);
}

function calculateF1(yTrue, yPred, label) {
    let tp = 0, fp = 0, fn = 0;
    for (let i = 0; i < yTrue.length; i++) {
        if (yPred[i] === label && yTrue[i] === label) tp++;
        if (yPred[i] === label && yTrue[i] !== label) fp++;
        if (yPred[i] !== label && yTrue[i] === label) fn++;
    }
    const precision = tp / (tp + fp || 1);
    const recall = tp / (tp + fn || 1);
    return 2 * precision * recall / (precision + recall || 1);
}

// API Routes
app.post('/upload_predictions', (req, res) => {
    try {
        const predictions = req.body; // Array of {id, prediction}
        const yTrue = [];
        const yPred = [];
        predictions.forEach(p => {
            if (groundTruth[p.id]) {
                yTrue.push(groundTruth[p.id]);
                yPred.push(p.prediction);
            }
        });
        const labels = Array.from(new Set([...yTrue, ...yPred]));
        const f1s = labels.map(label => calculateF1(yTrue, yPred, label));
        const macroF1 = f1s.reduce((a, b) => a + b, 0) / f1s.length;
        res.json({ macroF1, perClassF1: Object.fromEntries(labels.map((l, i) => [l, f1s[i]])) });
    } catch (error) {
        console.error('Error processing predictions:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

app.get('/', async (req, res) => {
    try {
        const sortBy = req.query.sortBy || 'fullContext';
        
        // Validate sortBy parameter
        const validSortFields = ['fullContext', 'goldEvidence', 'delta'];
        if (!validSortFields.includes(sortBy)) {
            return res.status(400).json({ 
                error: 'Invalid sort field', 
                validFields: validSortFields 
            });
        }
        
        // Load data from Supabase
        const data = await loadData();
        
        // Sort the data
        const sortedData = [...data].sort((a, b) => {
            if (sortBy === 'delta') {
                return b.delta - a.delta;
            }
            return (b[sortBy] || 0) - (a[sortBy] || 0);
        });

        res.json(sortedData);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Export the Express app for serverless environments
module.exports = app; 