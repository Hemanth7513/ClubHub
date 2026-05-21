const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://zfqpasaoelqampjutmhd.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmcXBhc2FvZWxxYW1wanV0bWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjAwMzMsImV4cCI6MjA5MzAzNjAzM30.wdTtjkHRL1jH2LqMRwSXAvQGMcG9eXoEgnnYpotoSuk';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️ Using fallback Supabase credentials. Please set them in the Render dashboard.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
