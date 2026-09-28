import { describe, expect, it } from "vitest";
import { FUND_CATEGORIES } from "@/types";
import { FUND_LABEL_KEYS, totalGiven } from "./donations/fund";
import { isoToLocalInput, localInputToIso } from "./events/dateTime";
import { effectiveStatus } from "./events/eventUtils";

describe("donations", () => {
  it("posts backend codes (every code has a translated label)", () => {
    for (const code of FUND_CATEGORIES) expect(FUND_LABEL_KEYS[code]).toBeTruthy();
  });

  it("counts completed payments only", () => {
    const d = (amount: string, status: "COMPLETED" | "PENDING" | "FAILED") => ({ payment: { amount, status } });
    expect(totalGiven([d("100.00", "COMPLETED"), d("50.00", "PENDING"), d("20.00", "FAILED"), d("5.50", "COMPLETED")])).toBe(105.5);
  });
});

describe("event dates", () => {
  it("round-trips datetime-local values through ISO", () => {
    const local = "2026-10-05T18:30";
    expect(isoToLocalInput(localInputToIso(local))).toBe(local);
  });

  it("derives status from dates", () => {
    const now = new Date("2026-10-05T12:00:00Z");
    const base = { id: 1, title: "", description: "", photo: null, created_by_name: null, created_at: "", place_name: null, place_url: null, service_group: null, service_group_name: null };
    expect(effectiveStatus({ ...base, status: "UPCOMING", start_date: "2026-10-01T10:00:00Z", end_date: "2026-10-01T12:00:00Z" }, now)).toBe("COMPLETED");
    expect(effectiveStatus({ ...base, status: "UPCOMING", start_date: "2026-10-05T11:00:00Z", end_date: "2026-10-05T13:00:00Z" }, now)).toBe("ONGOING");
    expect(effectiveStatus({ ...base, status: "UPCOMING", start_date: "2026-10-09T11:00:00Z", end_date: "2026-10-09T13:00:00Z" }, now)).toBe("UPCOMING");
  });
});
