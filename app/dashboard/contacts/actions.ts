'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateContactTags(contactId: string, tags: string[]) {
  const supabase = createClient();
  // Verify contact exists
  const { data: contact, error: fetchError } = await supabase
    .from('contacts')
    .select('id')
    .eq('id', contactId)
    .single();

  if (fetchError || !contact) {
    throw new Error('Contact not found');
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
