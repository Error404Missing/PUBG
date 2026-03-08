const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n');
let url = '', key = '';
env.forEach(l => {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.substring('NEXT_PUBLIC_SUPABASE_URL='.length).trim().replace(/["']/g, "");
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = l.substring('NEXT_PUBLIC_SUPABASE_ANON_KEY='.length).trim().replace(/["']/g, "");
});
console.log("URL:", url);

async function main() {
  const rs = await fetch(url + '/rest/v1/teams?select=*,profiles(username)&limit=1', {
    headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
  });
  console.log(rs.status);
  const data = await rs.json();
  console.log(data);
}
main();
