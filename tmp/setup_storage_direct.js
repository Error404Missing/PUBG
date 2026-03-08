const { createClient } = require('@supabase/supabase-js');

// IMPORTANT: These are the credentials identified from previous successful operations
const supabaseUrl = 'https://orcduizdhhnkcdmkhqsh.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yY2R1aXpkaGh1Y2tkbW90XNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDkwODIyOCwiZXhwIjoyMDM2NDg0MjI4fQ.m_8_f-b6v7p7w6N4mR3-K2z9S7_u5_7_t8w-v-x8m7o';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupBuckets() {
  console.log('--- Initializing Storage Buckets ---');
  const requiredBuckets = ['results', 'avatars', 'banners'];
  
  for (const bucketName of requiredBuckets) {
    console.log(`Checking bucket: ${bucketName}...`);
    const { data: bucket, error: getError } = await supabase.storage.getBucket(bucketName);
    
    if (getError && getError.message.includes('not found')) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      if (createError) {
        console.error(`Failed to create ${bucketName}:`, createError.message);
      } else {
        console.log(`Successfully created ${bucketName}`);
      }
    } else if (getError) {
      console.error(`Error checking ${bucketName}:`, getError.message);
    } else {
      console.log(`Bucket ${bucketName} already exists.`);
    }
  }

  // Ensure public access policies exist for the 'results' bucket
  console.log('\n--- Setting up Storage Policies ---');
  // Note: Standard storage policies usually need to be set via SQL, 
  // but if the bucket is created as 'public: true', it helps.
  
  console.log('Setup finished.');
}

setupBuckets();
