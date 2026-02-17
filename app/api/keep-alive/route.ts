import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Perform a lightweight query to keep the database active
    const { data, error } = await supabase
      .from('user_profile')
      .select('count')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
       console.error('Keep-alive query error:', error);
       return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
        status: 'ok', 
        message: 'Database connection verified', 
        timestamp: new Date().toISOString() 
    });

  } catch (error: any) {
    console.error('Keep-alive unexpected error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
