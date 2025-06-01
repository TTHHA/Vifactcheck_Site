const express = require('express');
const supabase = require('../supabase');

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

module.exports = async (req, res) => {
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
        res.json([]);
    }
}; 