const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const fs = require('fs');
const app = express();

// Add JSON parsing middleware
app.use(express.json());

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
        console.error('Missing Supabase credentials:', {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey
        });
        throw new Error('Missing Supabase credentials');
    }
    
    console.log('Initializing Supabase client...');
    supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false
        },
        db: {
            schema: 'public'
        }
    });
    
    // Test the connection
    supabase.from('leaderboard').select('count').limit(1)
        .then(() => console.log('Successfully connected to Supabase'))
        .catch(err => {
            console.error('Failed to connect to Supabase:', err);
            throw err;
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
            console.log(`Database operation attempt ${i + 1} of ${maxRetries}`);
            const result = await operation();
            if (i > 0) {
                console.log(`Database operation succeeded after ${i + 1} attempts`);
            }
            return result;
        } catch (error) {
            lastError = error;
            console.error(`Database operation attempt ${i + 1} failed:`, error.message);
            
            if (i < maxRetries - 1) {
                const delay = DB_CONFIG.retryDelay * Math.pow(2, i); // Exponential backoff
                console.log(`Retrying database operation in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    console.error(`All ${maxRetries} database operation attempts failed. Last error:`, lastError);
    throw new Error(`Database operation failed after ${maxRetries} attempts: ${lastError.message}`);
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
        console.log('Starting to load leaderboard data...');
        
        // First, check if the table exists
        const { error: tableCheckError } = await supabase
            .from('leaderboard')
            .select('count')
            .limit(1);
            
        if (tableCheckError) {
            console.error('Table check error:', tableCheckError);
            throw new Error(`Table check failed: ${tableCheckError.message}`);
        }
        
        console.log('Table exists, proceeding with data fetch...');
        
        const { data, error } = await retryOperation(async () => {
            console.log('Executing database query...');
            const result = await supabase
                .from('leaderboard')
                .select('*')
                .order('fullContext', { ascending: false });
            
            if (result.error) {
                console.error('Database query error:', result.error);
                throw new Error(`Database query failed: ${result.error.message}`);
            }
            
            return result;
        });

        if (!data) {
            console.warn('No data returned from database');
            return [];
        }

        console.log(`Retrieved ${data.length} entries from database`);

        // Filter and validate entries
        const validEntries = (data || [])
            .filter(entry => {
                try {
                    if (!entry) {
                        console.warn('Skipping null/undefined entry');
                        return false;
                    }
                    return validateLeaderboardEntry(entry);
                } catch (error) {
                    console.warn(`Invalid entry skipped: ${error.message}`, entry);
                    return false;
                }
            })
            .map(entry => ({
                ...entry,
                delta: entry.goldEvidence - entry.fullContext
            }));

        console.log(`Successfully processed ${validEntries.length} valid entries`);
        return validEntries;
    } catch (error) {
        console.error('Error loading leaderboard data:', error);
        if (error.message.includes('Database query failed')) {
            throw new Error('Database connection error. Please try again later.');
        }
        if (error.message.includes('Table check failed')) {
            throw new Error('Leaderboard table not found or inaccessible.');
        }
        throw new Error(`Failed to load leaderboard data: ${error.message}`);
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
app.get('/api/leaderboard', async (req, res) => {
    try {
        console.log('Received leaderboard request');
        const sortBy = req.query.sortBy || 'fullContext';
        
        // Validate sortBy parameter
        const validSortFields = ['fullContext', 'goldEvidence', 'delta'];
        if (!validSortFields.includes(sortBy)) {
            console.warn(`Invalid sort field requested: ${sortBy}`);
            return res.status(400).json({ 
                error: 'Invalid sort field', 
                validFields: validSortFields 
            });
        }
        
        console.log(`Loading data with sort: ${sortBy}`);
        // Load data from Supabase
        const data = await loadData();
        
        // Sort the data
        const sortedData = [...data].sort((a, b) => {
            if (sortBy === 'delta') {
                return b.delta - a.delta;
            }
            return (b[sortBy] || 0) - (a[sortBy] || 0);
        });

        console.log(`Returning ${sortedData.length} sorted entries`);
        res.json(sortedData);
    } catch (error) {
        console.error('Error processing leaderboard request:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.post('/api/upload_predictions', (req, res) => {
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Not Found',
        message: `The requested endpoint ${req.method} ${req.url} does not exist`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', (error) => {
    if (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
    
    const address = server.address();
    console.log(`Server started successfully!`);
    console.log(`Listening on: http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET  /api/leaderboard');
    console.log('- POST /api/upload_predictions');
    console.log('- GET  /api/health');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Export the Express app for serverless environments
module.exports = app; 