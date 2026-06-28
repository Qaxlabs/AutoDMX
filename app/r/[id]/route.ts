import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const linkId = params.id;

  try {
    // 1. Fetch original URL and automation ID
    const { data: trackData, error } = await supabase
      .from('tracked_links')
      .select('automation_id, original_url')
      .eq('id', linkId)
      .maybeSingle();

    if (error || !trackData) {
      console.error('[Redirect Route] Failed to fetch tracked link:', error);
      return new Response('Link Not Found', { status: 404 });
    }

    // 2. Log click event
    const { error: clickError } = await supabase
      .from('link_clicks')
      .insert({
        automation_id: trackData.automation_id,
        url: trackData.original_url,
      });

    if (clickError) {
      console.error('[Redirect Route] Failed to log click:', clickError);
    }

    // 3. Perform 307 Temporary Redirect to destination URL
    return NextResponse.redirect(trackData.original_url, 307);
  } catch (err) {
    console.error('[Redirect Route Error] Unexpected exception:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
