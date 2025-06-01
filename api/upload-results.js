const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const { Readable } = require('stream');

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

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'application/json') {
            return cb(new Error('Only JSON files are allowed'));
        }
        cb(null, true);
    }
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

// Save data to Supabase
async function saveData(data) {
    try {
        // Validate the data
        validateLeaderboardEntry(data);

        const { error } = await retryOperation(async () => {
            return await supabase
                .from('leaderboard')
                .insert(data);
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

// Helper function to handle file upload
function handleFileUpload(req) {
    return new Promise((resolve, reject) => {
        upload.single('results')(req, {}, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Handle file upload
        await handleFileUpload(req);

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const teamName = req.body.teamName;
        if (!teamName) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        // Parse the JSON file content
        let results;
        try {
            const fileContent = req.file.buffer.toString('utf8');
            results = JSON.parse(fileContent);
        } catch (error) {
            return res.status(400).json({ 
                message: 'Invalid JSON file format',
                details: error.message 
            });
        }
        
        // Add team name and current date
        results.team = teamName;
        results.date = new Date().toISOString().split('T')[0];

        // Save to Supabase
        await saveData(results);

        res.json({ message: 'Results uploaded successfully' });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ 
            message: 'Error processing upload',
            details: error.message 
        });
    }
}; 