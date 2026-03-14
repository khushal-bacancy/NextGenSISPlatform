import { describe, expect, it } from "vitest";

import { badRequest, ok, serverError } from "@/app/api/_shared";

describe("api response helpers", () => {
  it("builds success envelope", async () => {
    const response = ok({ value: 1 });
    const json = (await response.json()) as { data: { value: number }; error: string | null };

    expect(response.status).toBe(200);
    expect(json.error).toBeNull();
    expect(json.data.value).toBe(1);
  });

  it("builds bad request envelope", async () => {
    const response = badRequest("Invalid payload");
    const json = (await response.json()) as { data: null; error: string };

    expect(response.status).toBe(400);
    expect(json.error).toBe("Invalid payload");
  });

  it("builds server error envelope", async () => {
    const response = serverError("DB down");
    const json = (await response.json()) as { data: null; error: string };

    expect(response.status).toBe(500);
    expect(json.error).toBe("DB down");
  });
});
