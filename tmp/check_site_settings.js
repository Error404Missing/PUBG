const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    "https://orcduizdhhnkcdmkhqsh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yY2R1aXpkaGh1Y2tkbW90XNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUyODg5MCwiZXhwIjoyMDgxMTA0ODkwfQ.P5qAvmIqq6NDSF-9fWB3IzO-Sivt6hO18SXiJHE8vKk"
);

async function check() {
    const { data, error } = await supabase.from("site_settings").select("*");
    console.log("data:", data, "error:", error);
}

check();
