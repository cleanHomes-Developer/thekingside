import { NextRequest } from "next/server";

function getOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isRequestFromAllowedOrigin(request: NextRequest) {
  const allowed = process.env.NEXT_PUBLIC_APP_URL;
  if (!allowed) {
    return true;
  }

  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");
  const origin = originHeader ?? refererHeader;
  if (!origin) {
    return true;
  }

  const allowedOrigin = getOrigin(allowed);
  const requestOrigin = getOrigin(origin);
  if (!allowedOrigin || !requestOrigin) {
    return false;
  }

  return allowedOrigin === requestOrigin;
}
