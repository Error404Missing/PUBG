import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    console.log("Initializing storage buckets...")
    
    // Check if buckets exist, if not create them
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) throw listError

    const requiredBuckets = ["results", "avatars", "banners"]
    
    for (const bucketName of requiredBuckets) {
      const exists = buckets.find(b => b.name === bucketName)
      if (!exists) {
        console.log(`Creating bucket: ${bucketName}`)
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        })
        if (createError) console.error(`Error creating ${bucketName}:`, createError)
      } else {
        console.log(`Bucket ${bucketName} already exists`)
      }
    }

    // Also fix RLS for storage (though admin client bypasses it, we need it for public access)
    // This is best done via SQL, but we can try to ensure the buckets are public.
    
    return NextResponse.json({ success: true, message: "Storage initialized" })
  } catch (error: any) {
    console.error("Storage Init Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
