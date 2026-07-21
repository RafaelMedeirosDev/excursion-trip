export interface JwtPayload {
  sub: string;
  organizationId: string;
  role: "ADM" | "EMPLOYEE";
  iat: number;
  exp: number;
}

export function decodeJwt(token: string): JwtPayload {
  const payload = token.split(".")[1];
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(normalized);
  return JSON.parse(decoded);
}
