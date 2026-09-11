import { defineRailway, github, postgres, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const excursionTrip = github("RafaelMedeirosDev/excursion-trip", { checkSuites: false });

  const Postgres = postgres("Postgres", { region: "europe-west4-drams3a" });
  Postgres.networking = { privateNetworkEndpoint: "postgres", tcpProxies: { "5432": {} } };
  const postgresVolume = volume("postgres-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "europe-west4-drams3a", sizeMB: 5000 });
  const _excursionTripbackend = service("@excursion-trip/backend", {
    source: excursionTrip,
    build: { buildCommand: "pnpm install --frozen-lockfile && pnpm --filter @excursion-trip/backend exec prisma generate && pnpm --filter @excursion-trip/backend build", buildEnvironment: "V3", builder: "RAILPACK", watchPatterns: ["/apps/backend/**", "/packages/**", "/pnpm-lock.yaml", "/pnpm-workspace.yaml", "/package.json"] },
    start: "pnpm --filter @excursion-trip/backend start",
    preDeploy: "pnpm --filter @excursion-trip/backend exec prisma migrate deploy",
    healthcheck: "/health",
    replicas: { "europe-west4-drams3a": 1 },
    networking: { privateNetworkEndpoint: "excursion-tripbackend" },
    env: { CORS_ORIGIN: preserve(), DATABASE_URL: preserve(), JWT_EXPIRES_IN: preserve(), JWT_SECRET: preserve(), RAILPACK_NODE_VERSION: preserve(), REFRESH_TOKEN_EXPIRES_IN_HOURS: preserve() },
  });
  const _excursionTripfrontend = service("@excursion-trip/frontend", {
    source: excursionTrip,
    build: { buildCommand: "pnpm --filter @excursion-trip/frontend build", buildEnvironment: "V3", builder: "RAILPACK", watchPatterns: ["/apps/frontend/**", "/packages/**", "/pnpm-lock.yaml", "/pnpm-workspace.yaml", "/package.json"] },
    start: "",
    healthcheck: "/health",
    replicas: { "europe-west4-drams3a": 1 },
    networking: { privateNetworkEndpoint: "excursion-tripfrontend" },
    env: { RAILPACK_NODE_VERSION: preserve(), RAILPACK_SPA_OUTPUT_DIR: preserve(), VITE_API_URL: preserve() },
  });

  return project("thriving-connection", {
    resources: [_excursionTripbackend, _excursionTripfrontend, Postgres, postgresVolume],
  });
});
