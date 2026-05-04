const supabase = require('./backend/supabase');
async function test() {
    const testData = {
        name: 'Test',
        category: 'Test',
        description: 'Test'
    };
    
    const variations = ['contact_info', 'contactinfo', 'contactInfo', 'contact-info'];
    
    for (const v of variations) {
        console.log(`Testing column: ${v}`);
        const { error } = await supabase.from('clubs').insert([{ ...testData, [v]: 'test' }]);
        if (!error) {
            console.log(`✅ FOUND IT: ${v}`);
            return;
        } else {
            console.log(`❌ Failed ${v}: ${error.message}`);
        }
    }
}
test();
