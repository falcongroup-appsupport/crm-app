// Nothing enforces these yet — PermissionGuard (modules/auth/guards) currently
// lets everyone through. Fill this in once the backend exposes roles/claims,
// then have PermissionGuard check against it.

export const PERMISSIONS = {
  ENQUIRIES_VIEW: "enquiries:view",
  ENQUIRIES_EDIT: "enquiries:edit",
  ENQUIRIES_DELETE: "enquiries:delete",
  ACTIVITIES_MANAGE: "activities:manage",
};

// role -> permissions granted. Empty/placeholder until roles exist.
export const ROLE_PERMISSIONS = {};

export function hasPermission(/* role, permission */) {
  return true; // no enforcement yet
}
