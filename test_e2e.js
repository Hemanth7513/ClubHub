async function testE2E() {
    const baseURL = 'http://localhost:5000/api';
    
    try {
        console.log("0. Registering test user (ignoring if exists)...");
        await fetch(`${baseURL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testuser@example.com',
                password: 'Password123',
                name: 'Test Bot'
            })
        });

        console.log("1. Logging in...");
        const loginRes = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testuser@example.com',
                password: 'Password123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Login successful. Token acquired.");

        console.log("2. Adding a new club...");
        const clubData = {
            name: 'E2E Test Club',
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
        const addData = await addRes.json();
        console.log("Club added successfully:", addData);

        console.log("3. Verifying club in directory...");
        const listRes = await fetch(`${baseURL}/clubs`);
        const listData = await listRes.json();
        const latestClub = listData.find(c => c.name === 'E2E Test Club');
        if (latestClub) {
            console.log("VERIFICATION SUCCESS: 'E2E Test Club' found in database!");
        } else {
            console.log("VERIFICATION FAILED: 'E2E Test Club' NOT found.");
        }

    } catch (error) {
        console.error("E2E Test Error:", error.message);
    }
}

testE2E();
