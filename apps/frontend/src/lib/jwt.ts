import type { Role } from "@excursion-trip/shared";

export interface JwtPayload {
  sub: string;
  organizationId: string;
  role: Role;
  iat: number;
  exp: number;
}

export function decodeJwt(token: string): JwtPayload {
  const payload = token.split(".")[1];
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(normalized);
  return JSON.parse(decoded);
}
