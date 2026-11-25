/** Security headers applied to every Worker response (see src/server.ts). */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://api.fontshare.com https://fonts.googleapis.com",
  "font-src 'self' data: https://cdn.jsdelivr.net https://cdn.fontshare.com https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  const type = headers.get("content-type") ?? "";
  if (type.includes("text/html")) headers.set("Content-Security-Policy", CSP);
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
