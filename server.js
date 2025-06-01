const express = require('express');
const supabase = require('./supabase');
const app = express();

app.use(express.static('.'));

// API endpoint to get leaderboard data
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('fullContext', { ascending: false });
        
        if (error) throw error;
        
        // Filter out entries with null or invalid values
        const validData = (data || []).filter(entry => 
            entry && 
            entry.team && 
            entry.model && 
            typeof entry.fullContext === 'number' && 
            typeof entry.goldEvidence === 'number'
        );
        
        res.json(validData);
    } catch (error) {
        res.json([]);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
