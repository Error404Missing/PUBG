const { createClient } = require('@supabase/supabase-js');
const url = 'https://orcduizdhhnkcdmkhqsh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yY2R1aXpkaGh1Y2tkbW90XNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUyODg5MCwiZXhwIjoyMDgxMTA0ODkwfQ.P5qAvmIqq6NDSF-9fWB3IzO-Sivt6hO18SXiJHE8vKk';
const supabase = createClient(url, key);

async function checkAndFixProfiles() {
    console.log('Fetching profiles...');
    const { data: profiles, error } = await supabase.from('profiles').select('*');
    
    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log(`Found ${profiles.length} profiles.`);
    
    for (const profile of profiles) {
        console.log(`- ${profile.username} (${profile.email}): is_admin=${profile.is_admin}, role=${profile.role}`);
        
        // If the user has 'admin' in their email or role is admin, force is_admin to true
        if (profile.role === 'admin' || profile.username.toLowerCase().includes('admin')) {
            console.log(`  Updating ${profile.username} to be a full admin...`);
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_admin: true, role: 'admin' })
                .eq('id', profile.id);
            
            if (updateError) console.error(`  Failed to update ${profile.username}:`, updateError);
            else console.log(`  Successfully updated ${profile.username}`);
        }
    }
}

checkAndFixProfiles();
