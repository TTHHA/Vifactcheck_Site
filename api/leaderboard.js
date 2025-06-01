const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const fs = require('fs');
const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to ensure numeric values
function ensureNumeric(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
}

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

        // Filter out entries with null or invalid values and calculate delta
        return (data || []).filter(entry => 
            entry && 
            entry.team && 
            entry.model && 
            typeof entry.fullContext === 'number' && 
            typeof entry.goldEvidence === 'number'
        ).map(entry => ({
            ...entry,
            delta: entry.goldEvidence - entry.fullContext
        }));
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

// Load ground truth once at startup
const groundTruth = {}; // { id: label }
const gtData = JSON.parse(fs.readFileSync('ground_truth.json', 'utf8'));
gtData.forEach(row => {
  groundTruth[row.id] = row.label;
});

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

app.post('/upload_predictions', (req, res) => {
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
});

app.listen(3000, () => console.log('Server started on port 3000'));

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sortBy = req.query.sortBy || 'fullContext';
        
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
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 