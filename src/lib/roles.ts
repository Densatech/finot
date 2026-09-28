import { ROLES, type AuthUser, type RoleName } from "@/types";

export function hasRole(user: AuthUser | null | undefined, ...roles: RoleName[]): boolean {
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}

export function isSuperAdmin(user: AuthUser | null | undefined): boolean {
  return hasRole(user, ROLES.SUPER_ADMIN);
}

/** True for SuperAdmins or anyone holding one of the given roles. */
export function can(user: AuthUser | null | undefined, ...roles: RoleName[]): boolean {
  return isSuperAdmin(user) || hasRole(user, ...roles);
}
