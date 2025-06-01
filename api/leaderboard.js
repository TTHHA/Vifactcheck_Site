const { createClient } = require('@supabase/supabase-js');

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