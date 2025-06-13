/**
 * Generic proxy route that forwards requests from the Next.js frontend to the
 * Bytebot agent backend.  All client‐side code should call these API routes
 * (e.g. /api/bytebot/tasks) instead of hitting the agent server directly so
 * that the backend URL and secret tokens never reach the browser.
 */

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic"; // always run on server

const BACKEND_BASE_URL = process.env.BYTEBOT_AGENT_BASE_URL;

if (!BACKEND_BASE_URL) {
  // Fail fast during build/start-up rather than at runtime.
  throw new Error("Environment variable BYTEBOT_AGENT_BASE_URL is not defined");
}

// List of headers that are either generated automatically by the bytebot
// backend or forbidden to be set by browsers, which we therefore strip before
// relaying the response.
const HOP_BY_HOP_HEADERS = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  // Encoding is re-calculated by the edge runtime when streaming.
  "content-encoding",
];

async function proxy(request: NextRequest) {
  const url = new URL(request.url);
  // Extract everything after /api/bytebot/
  let relativePath = url.pathname.replace(/^\/api\/bytebot\//, "");
  // Ensure no leading slash
  relativePath = relativePath.replace(/^\//, "");
  const targetUrl = `${BACKEND_BASE_URL}/${relativePath}${url.search}`;

  // Reuse original headers but drop the host header so that node-fetch will
  // derive the correct one from targetUrl.
  // Clone headers to avoid mutating the original; cast to any to satisfy TS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const forwardedHeaders = new Headers(request.headers as unknown as any);
  forwardedHeaders.delete("host");

  // Forward request body for non-GET/HEAD methods.
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers: forwardedHeaders,
    body,
    // Note: Node.js fetch does not yet support the RequestInit.duplex option.
  });

  // Clone headers because NextResponse/Response will validate them.
  const responseHeaders = new Headers(backendResponse.headers);
  for (const h of HOP_BY_HOP_HEADERS) {
    responseHeaders.delete(h);
  }

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

// Next.js route handlers must export one function per HTTP method. We bind the
// generic proxy to each method we care about.
export function GET(request: NextRequest) {
  return proxy(request);
}

export function POST(request: NextRequest) {
  return proxy(request);
}

export function PUT(request: NextRequest) {
  return proxy(request);
}

export function PATCH(request: NextRequest) {
  return proxy(request);
}

export function DELETE(request: NextRequest) {
  return proxy(request);
}

export function OPTIONS(request: NextRequest) {
  return proxy(request);
}
