const { createClient } = require('@supabase/supabase-js');
const url = 'https://orcduizdhhnkcdmkhqsh.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yY2R1aXpkaGh1Y2tkbW90XNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUyODg5MCwiZXhwIjoyMDgxMTA0ODkwfQ.P5qAvmIqq6NDSF-9fWB3IzO-Sivt6hO18SXiJHE8vKk';
const supabase = createClient(url, key);

async function checkAdmins() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Total profiles:', data.length);
    console.log('Admins (by is_admin):', data.filter(p => p.is_admin === true).map(p => p.username));
    console.log('Admins (by role):', data.filter(p => p.role === 'admin').map(p => p.username));
}

checkAdmins();
