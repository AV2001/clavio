'use server';

import { inviteTeamMember } from '@/app/api/teamApi';

export async function inviteTeamMemberAction(email) {
  try {
    const result = await inviteTeamMember({ email });
    return { success: result.success, message: result.message };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
