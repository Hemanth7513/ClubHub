const supabase = require('./backend/supabase');
async function check() {
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'clubs' });
    // If rpc fails, try selecting a non-existent column to see error message
    if (error) {
        console.log("RPC Error:", error.message);
        const { error: err2 } = await supabase.from('clubs').select('name, category, description, location, contactInfo, imageUrl, establishedYear, googleMapsUrl').limit(1);
        console.log("Select Error:", err2 ? err2.message : "Success");
    } else {
        console.log("Table info:", data);
    }
}
check();
