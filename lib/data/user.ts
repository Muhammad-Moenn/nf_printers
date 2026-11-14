import {
  getProfileAction,
  updateEmailPreferencesAction,
  updateProfileAction,
} from "@/app/actions/user_action";

export async function getProfile() {
  return getProfileAction();
}

export async function updateProfile(
  ...args: Parameters<typeof updateProfileAction>
) {
  return updateProfileAction(...args);
}

export async function updateEmailPreferences(
  ...args: Parameters<typeof updateEmailPreferencesAction>
) {
  return updateEmailPreferencesAction(...args);
}
