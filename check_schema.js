const supabase = require('./backend/supabase');
async function check() {
    const { data, error } = await supabase.from('clubs').select('*').limit(1);
    console.log("Error:", error);
    console.log("Data columns:", data ? Object.keys(data[0] || {}) : "No data");
}
check();
