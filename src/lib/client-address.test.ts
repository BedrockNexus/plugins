import { afterEach, describe, expect, it } from "vitest";

import { getClientAddress } from "./client-address";

const originalHops = process.env.TRUSTED_PROXY_HOPS;
const originalHeader = process.env.CLIENT_IP_HEADER;

afterEach(() => {
  process.env.TRUSTED_PROXY_HOPS = originalHops;
  process.env.CLIENT_IP_HEADER = originalHeader;
});

describe("client address", () => {
  it("ignores client-supplied X-Forwarded-For entries", () => {
    delete process.env.TRUSTED_PROXY_HOPS;
    delete process.env.CLIENT_IP_HEADER;
    const headers = new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2, 203.0.113.9" });
    expect(getClientAddress(headers)).toBe("203.0.113.9");
  });

  it("prefers a configured edge header", () => {
    process.env.CLIENT_IP_HEADER = "CF-Connecting-IP";
    const headers = new Headers({
      "cf-connecting-ip": "198.51.100.4",
      "x-forwarded-for": "1.1.1.1",
    });
    expect(getClientAddress(headers)).toBe("198.51.100.4");
  });
});
