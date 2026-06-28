'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export type AutomationInput = {
  accountId: string;
  name: string;
  triggerType: 'comment' | 'dm' | 'story_reply' | 'story_mention';
  mediaScope: 'specific' | 'any' | 'next';
  mediaId: string | null;
  keywords: string[];
  publicReplyVariants: string[];
  openingDm: string;
  requiresFollow: boolean;
  followUpMessage: string | null;
  followUpDelayMinutes: number | null;
  finalMessage: string | null;
  finalLinks: string[];
  emailCapture: boolean;
  isActive: boolean;
};

export async function savePostAutomation(input: AutomationInput) {
  const supabase = createClient();

  // Verify the account exists
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id')
    .eq('id', input.accountId)
    .single();

  if (accountError || !account) {
    throw new Error('Account not found.');
  }

  // Check for existing automation for this specific post
  const { data: existingAutomation } = await supabase
    .from('automations')
    .select('id')
    .eq('account_id', input.accountId)
    .eq('media_id', input.mediaId)
    .eq('media_scope', 'specific')
    .maybeSingle();

  const automationData = {
    account_id: input.accountId,
    name: input.name,
    trigger_type: input.triggerType,
    media_scope: input.mediaScope,
    media_id: input.mediaId,
    keywords: input.keywords,
    public_reply_variants: input.publicReplyVariants,
    opening_dm: input.openingDm,
    requires_follow: input.requiresFollow,
    follow_up_message: input.followUpMessage,
    follow_up_delay_minutes: input.followUpDelayMinutes,
    final_message: input.finalMessage,
    final_links: input.finalLinks,
    email_capture: input.emailCapture,
    is_active: input.isActive,
  };

  let error;
  if (existingAutomation) {
    const { error: updateError } = await supabase
      .from('automations')
      .update(automationData)
      .eq('id', existingAutomation.id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from('automations')
      .insert(automationData);
    error = insertError;
  }

  if (error) {
    throw new Error(`Failed to save automation: ${error.message}`);
  }

  revalidatePath('/dashboard');
  return { success: true };
}
