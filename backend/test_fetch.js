const supabase = require('./supabase');

async function test() {
  const { data, error } = await supabase.from('clubs').select('*');
  console.log("Error:", error);
  console.log("Data count:", data?.length);
  process.exit(0);
}

test();
