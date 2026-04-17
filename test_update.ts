import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  console.log("Fetching order...");
  const { data: order, error: fetchErr } = await supabaseAdmin.from('orders').select('id, status').limit(1).single();
  if (fetchErr) return console.error("Fetch err:", fetchErr);
  
  console.log("Order found:", order);
  console.log("Updating to confirmed...");
  const { data, error } = await supabaseAdmin.from('orders').update({ status: 'confirmed' }).eq('id', order.id).select();
  
  if (error) console.error("Update error:", error);
  else console.log("Update success!", data);
}
test();
