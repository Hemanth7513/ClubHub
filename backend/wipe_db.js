const supabase = require('./supabase');

async function wipeDatabase() {
    console.log("Starting full database wipe...");
    try {
        // Delete in reverse order of dependencies to avoid foreign key constraint errors
        console.log("Wiping orders...");
        await supabase.from('orders').delete().neq('id', -1);
        
        console.log("Wiping tickets...");
        await supabase.from('tickets').delete().neq('id', -1);
        
        console.log("Wiping events...");
        await supabase.from('events').delete().neq('id', -1);
        
        console.log("Wiping clubs...");
        await supabase.from('clubs').delete().neq('id', -1);
        
        console.log("Wiping profiles...");
        await supabase.from('profiles').delete().neq('id', -1);
        
        console.log("Wiping users...");
        const { error } = await supabase.from('users').delete().neq('id', -1);
        if (error) throw error;
        
        console.log("✅ Database successfully wiped! We have a completely fresh start.");
    } catch (err) {
        console.error("❌ Error wiping database:", err);
    }
}

wipeDatabase();
