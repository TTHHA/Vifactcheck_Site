const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eysokbftalvupplicfzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5c29rYmZ0YWx2dXBwbGljZnp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODYxMzQxNywiZXhwIjoyMDY0MTg5NDE3fQ.jI8xH0sTDjiFd9ddx1NuTnMzdcrVoL6ZvQIov_C6doE';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
