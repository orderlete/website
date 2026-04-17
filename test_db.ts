import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  console.log("Error:", error);
  
  const { data: prof, error: e2 } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profile sample:", prof);
}
run();
