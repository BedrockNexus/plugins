import { createHash } from "node:crypto";
import { fetchMutation } from "convex/nextjs";

import { api } from "../../../../../convex/_generated/api";

function hashFingerprint(salt: string, namespace: string, value: string) {
  return createHash("sha256").update(`${salt}\0${namespace}\0${value}`).digest("hex");
}

function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function errorCode(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  const data = "data" in error ? error.data : undefined;
  if (typeof data === "object" && data !== null && "code" in data) {
    return typeof data.code === "string" ? data.code : undefined;
  }
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  if (message.includes("DOWNLOAD_RATE_LIMITED")) {
    return "DOWNLOAD_RATE_LIMITED";
  }
  if (message.includes("DOWNLOAD_NOT_FOUND")) {
    return "DOWNLOAD_NOT_FOUND";
  }
  return undefined;
}

function analyticsEvent(args: { projectSlug: string; version: string; counted: boolean }) {
  console.info("registry_download_redirect", args);
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ projectSlug: string; version: string }>;
  },
) {
  const redirectSecret = process.env.DOWNLOAD_REDIRECT_SECRET;
  if (!redirectSecret) {
    return new Response("Download service is not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const { projectSlug, version } = await params;
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectSlug) ||
    version.length < 1 ||
    version.length > 100
  ) {
    return new Response("Download not found.", { status: 404 });
  }

  const userAgent = request.headers.get("user-agent") || "unknown";
  const anonymousIdHash = hashFingerprint(redirectSecret, "address", clientAddress(request));
  const userAgentHash = hashFingerprint(redirectSecret, "user-agent", userAgent);

  try {
    const result = await fetchMutation(api.functions.projects.downloads.resolveAndRecord, {
      projectSlug,
      version,
      anonymousIdHash,
      userAgentHash,
      redirectSecret,
    });
    analyticsEvent({ projectSlug, version, counted: result.counted });
    return new Response(null, {
      status: 307,
      headers: {
        Location: result.url,
        "Cache-Control": "private, no-store, max-age=0",
        "X-BedrockNexus-Download-Counted": result.counted ? "1" : "0",
      },
    });
  } catch (error) {
    const code = errorCode(error);
    if (code === "DOWNLOAD_RATE_LIMITED") {
      return new Response("Too many download requests.", {
        status: 429,
        headers: { "Cache-Control": "no-store", "Retry-After": "10" },
      });
    }
    if (code === "DOWNLOAD_NOT_FOUND") {
      return new Response("Download not found.", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }
    console.error("registry_download_redirect_failed", { projectSlug, version });
    return new Response("Download service is temporarily unavailable.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
