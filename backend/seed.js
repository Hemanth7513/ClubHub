const { execSync } = require('child_process');
const supabase = require('./supabase'); // Assuming this exists

async function seed() {
    try {
        console.log("Fetching original database.js from git history...");
        const dbContent = execSync('git show 6b2a90a:backend/database.js', { encoding: 'utf-8' });
        
        // Use a dirty regex or evaluation to get the rawClubs array
        // The array starts with `const rawClubs = [` and ends with `];`
        const arrayStart = dbContent.indexOf('const rawClubs = [');
        const nextFunctionStart = dbContent.indexOf('rawClubs.forEach(');
        
        if (arrayStart === -1 || nextFunctionStart === -1) {
            console.error("Could not find rawClubs array.");
            return;
        }

        const arrayCode = dbContent.substring(arrayStart, nextFunctionStart);
        
        // We'll evaluate just this array assignment safely
        let rawClubs = [];
        eval(arrayCode);

        console.log(`Extracted ${rawClubs.length} clubs. Migrating to Supabase...`);

        // Check if supabase schema allows upsert by name
        // Wait, schema for clubs has columns: id, name, description, location, contact_info, image_url, founded_year, category, created_at
        const formattedClubs = rawClubs.map(c => ({
            name: c[0],
            category: c[1],
            description: c[2],
            location: c[3],
            contact_info: c[4],
            image_url: c[5],
            founded_year: c[6],
            google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c[0] + ' ' + (c[3] || '') + ' Vijayawada')}`,
            is_verified: true
        }));

        const { data, error } = await supabase
            .from('clubs')
            .insert(formattedClubs);

        if (error) {
            console.error("Error inserting clubs:", error);
        } else {
            console.log("Successfully inserted/upserted clubs!");
        }

    } catch (err) {
        console.error("Error during seeding:", err);
    }
}

seed();
