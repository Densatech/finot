import { describe, expect, it } from "vitest";
import { can, hasRole, isSuperAdmin } from "./roles";
import type { AuthUser, RoleName } from "@/types";

const user = (roles: RoleName[]): AuthUser => ({
  id: 1,
  email: "a@example.com",
  first_name: "A",
  middle_name: "",
  last_name: "B",
  full_name: "A B",
  gender: "M",
  roles,
  profile: null,
  membership: null,
});

describe("roles", () => {
  it("keeps every role of a multi-role user", () => {
    const u = user(["Student", "ServiceAdmin", "QAModerator"]);
    expect(hasRole(u, "ServiceAdmin")).toBe(true);
    expect(hasRole(u, "QAModerator")).toBe(true);
    expect(hasRole(u, "QACounselor")).toBe(false);
  });

  it("lets SuperAdmins through every gate", () => {
    const admin = user(["SuperAdmin"]);
    expect(isSuperAdmin(admin)).toBe(true);
    expect(can(admin, "CourseCoordinator")).toBe(true);
  });

  it("handles signed-out users", () => {
    expect(can(null, "Student")).toBe(false);
  });
});
