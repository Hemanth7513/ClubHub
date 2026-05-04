const supabase = require('./supabase');

async function seedEvents() {
    console.log("Fetching clubs to link events...");
    const { data: clubs, error: fetchError } = await supabase.from('clubs').select('id, name');
    
    if (fetchError) {
        console.error("Error fetching clubs:", fetchError);
        return;
    }

    if (!clubs || clubs.length === 0) {
        console.error("No clubs found. Please seed clubs first.");
        return;
    }

    const eventsToInsert = [
        {
            club_name: 'Rotary Club of Vijayawada',
            title: "Annual Charity Gala 2024",
            description: "A night of elegance and giving. Join us to support our local community initiatives in education and healthcare.",
            date: new Date(2024, 4, 15, 18, 30).toISOString(),
            location: "Gateway Hotel, Vijayawada",
            image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000",
            category: "Gala"
        },
        {
            club_name: 'GDG Vijayawada',
            title: "VJA Tech Summit: AI Edition",
            description: "Deep dive into GenAI and Large Language Models. Hands-on workshops and lightning talks by industry experts.",
            date: new Date(2024, 4, 22, 10, 0).toISOString(),
            location: "IT SEZ Conference Hall",
            image_url: "https://images.unsplash.com/photo-1540575861501-7ad0582373f3?q=80&w=1000",
            category: "Workshop"
        },
        {
            club_name: 'Friends Football Club',
            title: "Summer League Finals",
            description: "The biggest match of the season! Come support your local teams as they battle for the Vijayawada Cup.",
            date: new Date(2024, 5, 5, 16, 0).toISOString(),
            location: "IGMC Stadium",
            image_url: "https://images.unsplash.com/photo-1518605368461-1e1252220a77?q=80&w=1000",
            category: "Sports"
        },
        {
            club_name: 'Iron Hill Brewery',
            title: "Underground Beats Night",
            description: "Electronic night with local DJs. Exclusive craft beer menu and vibrant social atmosphere.",
            date: new Date(2024, 4, 12, 21, 0).toISOString(),
            location: "MG Road, Vijayawada",
            image_url: "https://images.unsplash.com/photo-1514525253361-bee8718a7439?q=80&w=1000",
            category: "Nightlife"
        },
        {
            club_name: 'Vijayawada Runners',
            title: "Riverfront Morning Run",
            description: "Weekly 10k group run along the Krishna riverfront. All skill levels welcome for health and fellowship.",
            date: new Date(2024, 4, 19, 5, 30).toISOString(),
            location: "Prakasam Barrage Road",
            image_url: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=1000",
            category: "Sports"
        }
    ];

    const finalEvents = eventsToInsert.map(e => {
        const club = clubs.find(c => c.name === e.club_name);
        if (!club) return null;
        const { club_name, ...eventData } = e;
        return { ...eventData, club_id: club.id };
    }).filter(e => e !== null);

    console.log(`Inserting ${finalEvents.length} events...`);
    
    // Clear existing events first
    await supabase.from('events').delete().neq('id', 0);

    const { error: insertError } = await supabase
        .from('events')
        .insert(finalEvents);

    if (insertError) {
        console.error("Error seeding events:", insertError);
    } else {
        console.log("Successfully seeded events linked to clubs!");
    }
}

seedEvents();
