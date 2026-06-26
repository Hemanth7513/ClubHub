require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkUsers() {
  const { data, error } = await supabase.from('users').select('email');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Users in DB:", data);
  }
}

checkUsers();
