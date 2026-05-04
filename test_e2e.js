async function testE2E() {
    const baseURL = 'http://localhost:5000/api';
    const uniqueEmail = `test_${Date.now()}@example.com`;
    
    try {
        console.log(`0. Registering test user (${uniqueEmail})...`);
        const regRes = await fetch(`${baseURL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: uniqueEmail,
                password: 'Password123',
                name: 'Test Bot'
            })
        });
        
        if (!regRes.ok) {
            const regError = await regRes.json();
            throw new Error(`Registration failed: ${regError.error}`);
        }
        console.log("Registration successful.");

        console.log("1. Logging in...");
        const loginRes = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: uniqueEmail,
                password: 'Password123'
            })
        });
        
        if (!loginRes.ok) {
            const loginError = await loginRes.json();
            throw new Error(`Login failed: ${loginError.error}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Login successful. Token acquired.");

        console.log("2. Adding a new club...");
        const clubName = `E2E Club ${Date.now()}`;
        const clubData = {
            name: clubName,
            category: 'Service Clubs',
            description: 'A club added via E2E test script to verify persistence.',
            location: 'Vijayawada Central',
            contactInfo: 'e2e@test.com',
            imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000',
            establishedYear: '2024'
        };

        const addRes = await fetch(`${baseURL}/clubs`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(clubData)
        });
        
        if (!addRes.ok) {
            const addError = await addRes.json();
            throw new Error(`Adding club failed: ${addError.error}`);
        }

        const addData = await addRes.json();
        console.log("Club added successfully:", addData.name);

        console.log("3. Verifying club in directory...");
        const listRes = await fetch(`${baseURL}/clubs`);
        const listData = await listRes.json();
        const latestClub = listData.find(c => c.name === clubName);
        
        if (latestClub) {
            console.log(`VERIFICATION SUCCESS: '${clubName}' found in database!`);
        } else {
            console.log(`VERIFICATION FAILED: '${clubName}' NOT found.`);
        }

    } catch (error) {
        console.error("❌ E2E Test Error:", error.message);
        process.exit(1);
    }
}

testE2E();
