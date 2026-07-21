const fs = require('fs');
const { execSync } = require('child_process');

try {
    const content = execSync('git show 6b2a90a:backend/database.js', { encoding: 'utf-8' });
    const start = content.indexOf('const rawClubs = [');
    const end = content.indexOf('rawClubs.forEach(');
    
    if (start === -1 || end === -1) {
        console.error("Could not find the array");
        process.exit(1);
    }
    
    const arrayCode = content.substring(start, end);

    let rawClubs = [];
    eval(arrayCode.replace('const rawClubs', 'rawClubs'));

    let sql = 'INSERT INTO clubs (name, category, description, location, contact_info, image_url, established_year, google_maps_url, is_verified) VALUES\n';
    rawClubs.forEach((c, i) => {
        const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c[0] + ' ' + (c[3] || '') + ' Vijayawada');
        const sanitize = str => str ? "'" + str.replace(/'/g, "''") + "'" : 'NULL';
        
        sql += `(${sanitize(c[0])}, ${sanitize(c[1])}, ${sanitize(c[2])}, ${sanitize(c[3])}, ${sanitize(c[4])}, ${sanitize(c[5])}, ${sanitize(c[6])}, ${sanitize(mapUrl)}, true)`;
        sql += i === rawClubs.length - 1 ? ';' : ',\n';
    });

    fs.writeFileSync('seed_clubs.sql', sql, 'utf8');
    console.log('Generated seed_clubs.sql with ' + rawClubs.length + ' clubs.');
} catch (e) {
    console.error("Failed", e);
}
