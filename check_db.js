const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'backend', 'clubhub.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) { console.error(err.message); return; }
    
    db.all("SELECT email, name FROM users", [], (err, rows) => {
        if (err) { console.error(err); return; }
        console.log("USERS:", JSON.stringify(rows, null, 2));
        
        db.all("SELECT name, category FROM clubs ORDER BY id DESC LIMIT 5", [], (err, rows) => {
            if (err) { console.error(err); return; }
            console.log("LATEST CLUBS:", JSON.stringify(rows, null, 2));
            db.close();
        });
    });
});
