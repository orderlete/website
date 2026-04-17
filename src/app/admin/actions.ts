'use server';

import { createClient } from '@supabase/supabase-js';

export async function updateOrderStatusAdmin(id: string, status: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: `Missing Admin Keys. Key exists? ${!!supabaseServiceKey}` };
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown Server Error' };
  }
}

export async function insertNotificationAdmin(payload: any) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: 'Missing Admin Keys' };
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin.from('notifications').insert(payload).select();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
