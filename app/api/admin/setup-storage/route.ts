import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  try {
    console.log("Storage Setup Triggered")
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing credentials in setup-storage:", { url: !!supabaseUrl, key: !!serviceRoleKey })
      return NextResponse.json({ 
        success: false, 
        error: "Missing SUPABASE_SERVICE_ROLE_KEY in environment variables. Please add it to Vercel/Local .env" 
      }, { status: 500 })
    }

    const supabase = createAdminClient()
    
    // Check if buckets exist, if not create them
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error("Bucket listing error:", listError)
      throw listError
    }

    const requiredBuckets = ["results", "profiles"]
    const results = []
    
    for (const bucketName of requiredBuckets) {
      const exists = buckets.find(b => b.name === bucketName)
      if (!exists) {
        console.log(`Attempting to create bucket: ${bucketName}`)
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
        })
        if (createError) {
          console.error(`Error creating ${bucketName}:`, createError)
          results.push(`${bucketName}: FAILED (${createError.message})`)
        } else {
          results.push(`${bucketName}: CREATED`)
        }
      } else {
        results.push(`${bucketName}: OK`)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Storage check complete", 
      details: results.join(", ") 
    })
  } catch (error: any) {
    console.error("Complete Storage Setup Crash:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
