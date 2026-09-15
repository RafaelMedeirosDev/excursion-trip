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

  // Restaura a organização de demonstração toda madrugada, para que um visitante
  // não deixe a demo bagunçada para o próximo. Roda o seed com SEED_RESET=1, que
  // apaga tudo da demo antes de semear — escopado pelo id literal da demo, então
  // a organização real é inalcançável.
  // O schedule é UTC: 06:00 UTC = 03:00 no horário de Brasília.
  const demoReset = service("demo-reset", {
    source: excursionTrip,
    build: {
      // só o client do Prisma: o seed roda por ts-node, não precisa do nest build
      buildCommand:
        "pnpm --filter @excursion-trip/backend exec prisma generate",
      buildEnvironment: "V3",
      builder: "RAILPACK",
      watchPatterns: [
        "/apps/backend/prisma/**",
        "/pnpm-lock.yaml",
        "/pnpm-workspace.yaml",
        "/package.json",
      ],
    },
    start: "pnpm --filter @excursion-trip/backend db:seed",
    replicas: { "europe-west4-drams3a": 1 },
    deploy: {
      cronSchedule: "0 6 * * *",
      // o processo tem que terminar e ficar terminado: se o Railway o reiniciar,
      // o serviço fica Active e ele pula todas as execuções seguintes
      restartPolicyType: "NEVER",
    },
    env: {
      DATABASE_URL: Postgres.env.DATABASE_URL,
      SEED_RESET: "1",
      RAILPACK_NODE_VERSION: "20",
    },
  });

  return project("thriving-connection", {
    resources: [
      _excursionTripbackend,
      _excursionTripfrontend,
      Postgres,
      postgresVolume,
      demoReset,
    ],
  });
});
