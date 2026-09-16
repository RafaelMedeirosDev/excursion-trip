import type { Config } from 'jest';
import base from './jest.config';

// Testes de integracao: Postgres real, rodados a parte dos unitarios.
//   pnpm --filter @excursion-trip/backend db:test:up
//   pnpm --filter @excursion-trip/backend test:int
const config: Config = {
  ...base,
  testRegex: '.*\\.int-spec\\.ts$',
  testPathIgnorePatterns: ['/node_modules/'],
  // Banco unico compartilhado + TRUNCATE entre casos: workers em paralelo
  // apagariam a fixture do vizinho no meio da execucao dele. Fica no config, e
  // nao numa flag de CLI, pra nao ser esquecido em invocacao avulsa.
  maxWorkers: 1,
  // O default de 5s nao cobre conexao fria + fixture + chamadas concorrentes.
  testTimeout: 60_000,
  globalSetup: '<rootDir>/test-support/globalSetup.ts',
};

export default config;
