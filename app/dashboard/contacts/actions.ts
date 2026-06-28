'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateContactTags(contactId: string, tags: string[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify contact belongs to an account owned by user
  const { data: contact, error: fetchError } = await supabase
    .from('contacts')
    .select('id, accounts(user_id)')
    .eq('id', contactId)
    .single();

  if (fetchError || !contact) {
    throw new Error('Contact not found');
  }

  // Check ownership
  const accountUser = (contact as unknown as { accounts: { user_id: string } | null }).accounts?.user_id;
  if (accountUser !== user.id) {
    throw new Error('Unauthorized contact modification.');
  }

  const { error: updateError } = await supabase
    .from('contacts')
    .update({ tags })
    .eq('id', contactId);

  if (updateError) {
    throw new Error(`Failed to update tags: ${updateError.message}`);
  }

  revalidatePath('/dashboard/contacts');
  return { success: true };
}
