'use server';

import { createOrganization } from '@/api/organizationApi';
import { revalidatePath } from 'next/cache';

export async function createOrganizationAction(formData) {
  const organization = {
    name: formData.get('name'),
  };

  await createOrganization(organization);

  revalidatePath('/organizations');
}
