const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    } else {
        console.warn('Running in development mode with missing credentials. Please create a .env file.');
    }
}

// Create Supabase client with the credentials
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase; 