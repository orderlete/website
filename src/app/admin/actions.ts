'use server';

import { createClient } from '@supabase/supabase-js';

export async function updateOrderStatusAdmin(id: string, status: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: 'Missing Admin Keys' };
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Update the order
    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) return { success: false, error: error.message };

    // 2. Automate Push Notification
    const titles: Record<string, string> = {
      'confirmed': 'Order Confirmed! 🎊',
      'shipped': 'Order Shipped! 🚚',
      'delivered': 'Delivered! 🍕',
      'cancelled': 'Order Cancelled 🛑',
    };

    const messages: Record<string, string> = {
      'confirmed': 'The store has confirmed your order. We are preparing it now.',
      'shipped': 'Your order is on the way! Our rider is racing to your location.',
      'delivered': 'Enjoy your treats! Please rate your experience in the app.',
      'cancelled': 'We are sorry, your order was cancelled. Contact support for help.',
    };

    if (titles[status]) {
      await supabaseAdmin.from('notifications').insert({
        title: titles[status],
        message: messages[status],
        type: status === 'cancelled' ? 'alert' : 'info',
        user_id: updatedOrder.user_id, // Targeting specific user
      });
    }
    
    return { success: true, data: updatedOrder };
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

export async function updateStoreStatusAdmin(status: 'open' | 'closed') {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: 'Missing Admin Keys' };
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if store_status setting exists
    const { data: existing } = await supabaseAdmin.from('settings').select('*').eq('key', 'store_status').single();
    
    let error;
    if (existing) {
      const res = await supabaseAdmin.from('settings').update({ value: status }).eq('key', 'store_status');
      error = res.error;
    } else {
      const res = await supabaseAdmin.from('settings').insert({ key: 'store_status', value: status });
      error = res.error;
    }
    
    if (error) return { success: false, error: error.message };
    return { success: true, status };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
