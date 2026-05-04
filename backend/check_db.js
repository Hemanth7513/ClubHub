const supabase = require('./supabase');

async function check() {
  const { data, error } = await supabase.from('clubs').select('*');
  if (error) {
    console.error('Error fetching clubs:', error);
  } else {
    console.log(`Found ${data.length} clubs in database.`);
    if (data.length > 0) {
      console.log('Sample club:', data[0].name, 'Category:', data[0].category);
    }
  }
}

check();
