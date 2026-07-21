require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCategories() {
  console.log("Fixing categories...");
  
  // Mapping of old simple categories to exact frontend categories
  const categoryMap = {
    'Technology': 'Student & Tech Groups',
    'Arts & Culture': 'Cultural & Literary Clubs',
    'Sports': 'Sports & Activity Clubs',
    'Lifestyle': 'Social & Recreation Clubs'
  };

  for (const [oldCat, newCat] of Object.entries(categoryMap)) {
    console.log(`Updating ${oldCat} -> ${newCat}`);
    
    // Update clubs
    const { error: clubErr } = await supabase
      .from('clubs')
      .update({ category: newCat })
      .eq('category', oldCat);
      
    if (clubErr) console.error(clubErr);

    // Update events
    const { error: eventErr } = await supabase
      .from('events')
      .update({ category: newCat })
      .eq('category', oldCat);
      
    if (eventErr) console.error(eventErr);
  }

  console.log("✅ Fixed categories in database to perfectly match the frontend Discovery Wheel!");
}

fixCategories();
