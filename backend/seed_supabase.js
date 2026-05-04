const supabase = require('./supabase');

const rawClubs = [
    ['Andhra Gymkhana Club', 'Social & Recreation Clubs', 'Historic recreation club offering sports, fitness, dining and networking in Gandhi Nagar. One of the oldest social institutions in the city.', 'Gandhi Nagar, Vijayawada', 'contact@andhragymkhana.com', 'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?q=80&w=1000', null],
    ['Vijayawada Club', 'Social & Recreation Clubs', 'Premier member-based social and recreational institution with swimming pool, tennis courts, gym and fine dining.', 'Tadepalli, Vijayawada', 'info@vijayawadaclub.com', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1000', '1989'],
    ['Executive Club Vijayawada', 'Social & Recreation Clubs', 'Upscale lifestyle club catering to business professionals with premium sports, banquet and networking facilities.', 'Vijayawada', 'info@executiveclub.in', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1000', null],
    ['Royal Clubs Association', 'Social & Recreation Clubs', 'Registered association focused on community service, social activities and fellowship for its members.', 'Vijayawada', 'info@royalclubsassociation.org', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000', null],
    ['C9 The Club', 'Social & Recreation Clubs', 'Popular members lounge and social club in Patamata offering evening leisure, dining and weekend events.', 'Patamata, Vijayawada', 'reservations@c9theclub.in', 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1000', null],
    ['Rotary Club of Vijayawada', 'Service Clubs', 'The flagship Rotary club of the city, part of Rotary District 3020. Focused on education, health and community service.', 'Vijayawada', 'info@rcvijayawada.rotaryindia.org', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000', '1952'],
    ['Rotary Club of Vijayawada Midtown', 'Service Clubs', 'Chartered April 1985. One of the most active Rotary chapters in the city with wide-ranging service projects.', 'Vijayawada', 'contact@rotarymidtown.org', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1000', '1984'],
    ['Rotary Club of Vijayawada East', 'Service Clubs', 'Active Rotary chapter focused on healthcare, education and youth development in east Vijayawada.', 'East Vijayawada', 'contact@rotaryvjaeast.org', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1000', null],
    ['Rotary Club One Town', 'Service Clubs', 'Long-standing Rotary chapter serving the One Town area of Vijayawada with health and welfare programs.', 'One Town, Vijayawada', 'rotaryonetown@gmail.com', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000', null],
    ['Vijayawada Lions Club', 'Service Clubs', 'Part of Lions District 316D. Focused on sight, hunger, environment and youth humanitarian initiatives.', 'Vijayawada', 'contact@lionsvijayawada.org', 'https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=1000', null],
    ['Vijayawada Mega City Lions Club', 'Service Clubs', 'One of the larger Lions clubs in the city running multiple community welfare and charity programs year-round.', 'Vijayawada', 'megacity@lionsvijayawada.org', 'https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=1000', null],
    ['Vijayawada East Lions Club', 'Service Clubs', 'Lions club serving east Vijayawada communities through blood donation drives, health camps and scholarship programs.', 'East Vijayawada', 'eastlions@gmail.com', 'https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=1000', null],
    ['Vasavya Mahila Mandali (VMM)', 'NGOs & Social Organizations', 'One of the oldest and most reputed NGOs in AP. Focuses on gender equality, child rights and womens empowerment.', 'Benz Circle, Vijayawada', 'contact@vasavya.org', 'https://images.unsplash.com/photo-1593113589914-07599a081bc1?q=80&w=1000', '1969'],
    ['Aashritha Charitable Trust', 'NGOs & Social Organizations', 'Engaged in elder care, Annadaanam (hunger relief), and education support for underprivileged children.', 'Governor Peta, Vijayawada', 'volunteer@aashritha.org', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000', '2021'],
    ['Child Aid Foundation', 'NGOs & Social Organizations', 'Dedicated to the protection, shelter, education and rehabilitation of orphaned and vulnerable children in Vijayawada.', 'Patamatalanka, Vijayawada', 'info@childaidfoundation.org', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000', null],
    ['SKCV Childrens Trust', 'NGOs & Social Organizations', 'Works with street children providing homes, education and rehabilitation to build a respectable future.', 'Vijayawada', 'info@skcv.org', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000', null],
    ['Amruta Hastam (Serving Hands)', 'NGOs & Social Organizations', 'Focuses on welfare of women and children through skill training, vocational workshops and community support.', 'Vijayawada', 'amrutahastam@gmail.com', 'https://images.unsplash.com/photo-1593113589914-07599a081bc1?q=80&w=1000', null],
    ['Seva Bharati Vijayawada', 'NGOs & Social Organizations', 'Operates extensively in education, health and social service for weaker sections of society across the city.', 'Vijayawada', 'info@sevabharativijayawada.org', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1000', null],
    ['Akshaya Patra Foundation', 'NGOs & Social Organizations', 'Runs large-scale school meal programs addressing malnutrition and supporting education of children.', 'Vijayawada', 'info@akshayapatra.org', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000', null],
    ['Smile Foundation', 'NGOs & Social Organizations', 'Promotes child welfare, education support and women empowerment through grassroots programs.', 'Vijayawada', 'info@smilefoundationindia.org', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000', null],
    ['People Welfare Society', 'NGOs & Social Organizations', 'Focused on child and youth development, counseling, drug abuse awareness and womens empowerment.', 'Vijayawada', 'info@peoplewelfaresociety.in', 'https://images.unsplash.com/photo-1593113589914-07599a081bc1?q=80&w=1000', null],
    ['HelpAge India - Vijayawada', 'NGOs & Social Organizations', 'Provides specialized services for the elderly including healthcare, social engagement and pension support.', 'Vijayawada', 'vijayawada@helpageindia.org', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1000', null],
    ['Hindustan Scouts and Guides', 'NGOs & Social Organizations', 'Youth development movement building character, citizenship and skills through scouting activities.', 'Vijayawada', 'scouts@vijayawada.org', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000', null],
    ['Friends Football Club', 'Sports & Activity Clubs', 'Active community organizing local matches, tournaments and training for football enthusiasts of all skill levels.', 'Vijayawada', 'info@friendsfc.in', 'https://images.unsplash.com/photo-1518605368461-1e1252220a77?q=80&w=1000', null],
    ['Best Sports Club Cricket Academy', 'Sports & Activity Clubs', 'Professional cricket coaching and well-maintained grounds for competitive and recreational play.', 'CTO Colony, Vijayawada', 'cricket@bestsports.local', 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000', '2015'],
    ['Vijayawada Runners', 'Sports & Activity Clubs', 'Passionate community of running enthusiasts promoting health, wellness and running culture with weekly group runs.', 'Vijayawada', 'hello@vijayawadarunners.com', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=1000', null],
    ['Vijayawada Randonneurs', 'Sports & Activity Clubs', 'Endurance cycling club affiliated with Audax India, organizing Brevets (BRMs) and long-distance rides.', 'Vijayawada', 'randonneurs.vja@gmail.com', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000', null],
    ['Amaravati Bicycle Club', 'Sports & Activity Clubs', 'Active cycling community organizing weekend group rides and promoting cycling for health and the environment.', 'Vijayawada - Amaravati region', 'abc@cycleclub.in', 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=1000', null],
    ['Vijayawada Badminton League', 'Sports & Activity Clubs', 'Organizes regular badminton tournaments and practice sessions across multiple courts in the city.', 'Various Courts, Vijayawada', 'vja.badminton@gmail.com', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000', null],
    ['Ram Mohan Library Reading Circle', 'Cultural & Literary Clubs', 'Historic library founded in 1911 hosting literary quizzes, book discussions and Telugu cultural events.', 'Buckinghampeta, Vijayawada', 'library@rammohan.local', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1000', '1911'],
    ['Sphoorthi Art & Music Academy', 'Cultural & Literary Clubs', 'Promotes classical music, dance and fine arts in Vijayawada through workshops and cultural performances.', 'Governorpet, Vijayawada', 'sphoorthi@artacademy.in', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1000', null],
    ['Vijayawada Film Society', 'Cultural & Literary Clubs', 'Curates screenings of world cinema and indie films to promote film literacy and appreciation in the city.', 'Vijayawada', 'filmsociety.vja@gmail.com', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1000', null],
    ['Telugu Sahitya Samskruthi', 'Cultural & Literary Clubs', 'Dedicated to the preservation and promotion of Telugu literature, poetry and cultural heritage through events and meets.', 'One Town, Vijayawada', 'sahitya@telugusangh.in', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000', null],
    ['Press Club Vijayawada', 'Professional & Networking', 'The official gathering point for media professionals, journalists and editors in the Krishna district.', 'Vijayawada', 'info@pressclubvja.in', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000', null],
    ['BNI Vijayawada Chapter', 'Professional & Networking', 'Business Network International chapter helping entrepreneurs and professionals grow through structured referrals and networking.', 'Vijayawada', 'vijayawada@bni.com', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1000', null],
    ['CII Andhra Pradesh', 'Professional & Networking', 'Confederation of Indian Industry regional office facilitating business growth, policy advocacy and industry events.', 'Vijayawada', 'ap@cii.in', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1000', null],
    ['Vijayawada Startup Community', 'Professional & Networking', 'Informal community of founders, investors and mentors meeting monthly to share learnings and support local startups.', 'Various Cafes, Vijayawada', 'startups.vja@gmail.com', 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000', null],
    ['null - Vijayawada Chapter', 'Student & Tech Groups', 'Open security community hosting monthly meetups, CTF events and Humla workshops focused on cybersecurity.', 'Various Tech Incubators, Vijayawada', 'https://null.community', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000', '2023'],
    ['GDG Vijayawada', 'Student & Tech Groups', 'Google Developer Group connecting local developers through tech talks, Google I/O Extended and hands-on codelabs.', 'Autonagar IT SEZ, Vijayawada', 'gdgvijayawada@gmail.com', 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1000', '2011'],
    ['GDSC KL University', 'Student & Tech Groups', 'Google Developer Student Club at KL University fostering a community of developers on campus.', 'KL University, Vaddeswaram', 'gdsc.klu@gmail.com', 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1000', null],
    ['AWS Cloud Club Vijayawada', 'Student & Tech Groups', 'Student-led AWS cloud computing community running workshops and certification study groups.', 'Vijayawada', 'awscloud.vja@gmail.com', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000', null],
    ['Vijayawada Python Users Group', 'Student & Tech Groups', 'Community of Python developers holding monthly meetups, hackathons and beginner workshops.', 'Vijayawada', 'pyug.vja@gmail.com', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?q=80&w=1000', null],
    ['Iron Hill Brewery', 'Nightlife & Entertainment', 'Popular craft brewery and restaurant with an extensive beer menu, live music nights and weekend events.', 'MG Road, Vijayawada', 'events@ironhill.in', 'https://images.unsplash.com/photo-1575037614876-c3853d406b76?q=80&w=1000', '1996'],
    ['Vault Brewery', 'Nightlife & Entertainment', 'Premium brewery in Vijayawada with a trendy industrial-chic vibe, cocktails and a curated food menu.', 'Vijayawada', 'contact@vaultbrewery.com', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000', null],
    ['League - The Infinity Club', 'Nightlife & Entertainment', 'One of Vijayawadas hottest nightlife destinations with premium DJ nights, themed parties and a vibrant crowd.', 'Vijayawada', 'info@leagueinfinityclub.com', 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=1000', null],
    ['Animal Club & Kitchen', 'Nightlife & Entertainment', 'Eclectic restaurant and bar known for its unique theme, inventive cocktails and a lively party scene.', 'Vijayawada', 'reservations@animalclub.in', 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?q=80&w=1000', null],
    ['Dropt. Beer & Spirits', 'Nightlife & Entertainment', 'Craft beer bar and lounge with a rotating tap list, board games and a relaxed social atmosphere.', 'Vijayawada', 'hello@dropt.beer', 'https://images.unsplash.com/photo-1575037614876-c3853d406b76?q=80&w=1000', null],
];

async function seed() {
    console.log("Seeding Supabase with snake_case naming (confirmed existing columns)...");
    const clubsToInsert = rawClubs.map(c => ({
        name: c[0],
        category: c[1],
        description: c[2],
        location: c[3],
        contact_info: c[4],
        image_url: c[5],
        established_year: c[6],
        google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c[0] + ' ' + (c[3] || '') + ' Vijayawada')}`
    }));

    // Delete existing to avoid duplicates
    await supabase.from('clubs').delete().neq('id', 0);

    const { data, error } = await supabase
        .from('clubs')
        .insert(clubsToInsert);

    if (error) {
        console.error("Error seeding:", error);
    } else {
        console.log("Successfully seeded 47+ clubs with snake_case naming!");
    }
}

seed();
