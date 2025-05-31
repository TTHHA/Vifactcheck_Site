const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Configure multer for file upload
const storage = multer.memoryStorage(); // Use memory storage instead of disk storage

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'application/json') {
            return cb(new Error('Only JSON files are allowed'));
        }
        cb(null, true);
    }
});

// Serve static files
app.use(express.static('.'));

// Store leaderboard data
let leaderboardData = [];

// Load initial data from the existing results
const initialData = [
    { team: "ViFactCheck", model: "Gemma", fullContext: 85.94, goldEvidence: 89.90, date: "2024-03-20" },

];

// Data file path
const dataDir = path.join(__dirname, 'data');
const dataFilePath = path.join(dataDir, 'leaderboard-data.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Load data from file if it exists, otherwise use initial data
function loadData() {
    try {
        if (fs.existsSync(dataFilePath)) {
            const fileContent = fs.readFileSync(dataFilePath, 'utf8');
            leaderboardData = JSON.parse(fileContent);
        } else {
            leaderboardData = [...initialData];
            // Save initial data to file
            fs.writeFileSync(dataFilePath, JSON.stringify(leaderboardData, null, 2));
        }
    } catch (error) {
        console.error('Error loading data:', error);
        leaderboardData = [...initialData];
    }
    return leaderboardData;
}

// Save data to file
function saveData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        leaderboardData = data; // Update the in-memory data
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

// Load initial data
loadData();

// API endpoint to upload results
app.post('/api/upload-results', upload.single('results'), (req, res) => {
    try {
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
        
        // Validate the results format
        if (!results.model) {
            return res.status(400).json({ message: 'Model name is required in the JSON file' });
        }
        if (typeof results.fullContext !== 'number') {
            return res.status(400).json({ message: 'fullContext must be a number in the JSON file' });
        }
        if (typeof results.goldEvidence !== 'number') {
            return res.status(400).json({ message: 'goldEvidence must be a number in the JSON file' });
        }

        // Add team name and current date
        results.team = teamName;
        results.date = new Date().toISOString().split('T')[0];

        // Get current data
        const currentData = loadData();
        
        // Add new results
        currentData.push(results);

        // Save updated data
        saveData(currentData);

        res.json({ message: 'Results uploaded successfully' });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ 
            message: 'Error processing upload',
            details: error.message 
        });
    }
});

// API endpoint to get leaderboard data
app.get('/api/leaderboard', (req, res) => {
    try {
        const sortBy = req.query.sortBy || 'fullContext';
        
        // Load fresh data from file
        const data = loadData();
        
        // Sort the data
        const sortedData = [...data].sort((a, b) => {
            if (sortBy === 'delta') {
                const deltaA = a.goldEvidence - a.fullContext;
                const deltaB = b.goldEvidence - b.fullContext;
                return deltaB - deltaA;
            }
            return b[sortBy] - a[sortBy];
        });

        res.json(sortedData);
    } catch (error) {
        console.error('Error getting leaderboard data:', error);
        res.status(500).json({ message: 'Error loading leaderboard data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Initial data loaded:', leaderboardData.length, 'entries');
}); 