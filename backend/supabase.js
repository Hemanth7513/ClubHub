const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// Use the service role key on the backend to bypass RLS — this key is NEVER exposed to the frontend
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Missing Supabase credentials. Please set them in the environment.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
