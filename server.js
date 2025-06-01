const express = require('express');
const multer = require('multer');
const supabase = require('./supabase');
const app = express();
const port = 3000;

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

// Serve static files
app.use(express.static('.'));

// Load leaderboard data from Supabase
async function loadData() {
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('fullContext', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return [];
        }

        // Filter out entries with null or invalid values
        return (data || []).filter(entry => 
            entry && 
            entry.team && 
            entry.model && 
            typeof entry.fullContext === 'number' && 
            typeof entry.goldEvidence === 'number'
        );
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

// Save data to Supabase
async function saveData(data) {
    try {
        const { error } = await supabase
            .from('leaderboard')
            .insert(data);

        if (error) throw error;
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

// API endpoint to upload results
app.post('/api/upload-results', upload.single('results'), async (req, res) => {
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
});

// API endpoint to get leaderboard data
app.get('/api/leaderboard', async (req, res) => {
    try {
        const sortBy = req.query.sortBy || 'fullContext';
        
        // Load data from Supabase
        const data = await loadData();
        
        // Sort the data
        const sortedData = [...data].sort((a, b) => {
            if (sortBy === 'delta') {
                const deltaA = (a.goldEvidence || 0) - (a.fullContext || 0);
                const deltaB = (b.goldEvidence || 0) - (b.fullContext || 0);
                return deltaB - deltaA;
            }
            return (b[sortBy] || 0) - (a[sortBy] || 0);
        });

        res.json(sortedData);
    } catch (error) {
        // console.error('Error getting leaderboard data:', error);
        // Return empty array instead of error
        res.json([]);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 