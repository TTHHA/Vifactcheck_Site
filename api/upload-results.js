const express = require('express');
const multer = require('multer');
const supabase = require('../supabase');

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

// Helper function to ensure numeric values
function ensureNumeric(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
}

// Save data to Supabase
async function saveData(data) {
    try {
        // Ensure numeric values before saving
        const processedData = {
            ...data,
            fullContext: ensureNumeric(data.fullContext),
            goldEvidence: ensureNumeric(data.goldEvidence),
            delta: ensureNumeric(data.goldEvidence) - ensureNumeric(data.fullContext)
        };

        const { error } = await supabase
            .from('leaderboard')
            .insert(processedData);

        if (error) throw error;
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

module.exports = async (req, res) => {
    // Handle file upload
    upload.single('results')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

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
            
            // Ensure numeric values
            results.fullContext = ensureNumeric(results.fullContext);
            results.goldEvidence = ensureNumeric(results.goldEvidence);
            results.delta = results.goldEvidence - results.fullContext;

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
}; 