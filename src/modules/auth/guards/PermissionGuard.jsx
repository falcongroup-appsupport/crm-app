// Wrap any element that should eventually be permission-gated:
//   <PermissionGuard permission={PERMISSIONS.ENQUIRIES_DELETE}><Button .../></PermissionGuard>
// hasPermission() always returns true today (see app/config/permissions.js).
import { hasPermission } from "../../../app/config/permissions";

export function PermissionGuard({
  permission,
  role,
  fallback = null,
  children,
}) {
  return hasPermission(role, permission) ? children : fallback;
}
