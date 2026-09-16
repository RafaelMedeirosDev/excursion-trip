import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const BACKEND_ROOT = resolve(__dirname, '..', '..');

const DEFAULT_TEST_URL =
  'postgresql://postgres:postgres@localhost:5433/excursion_trip_test?schema=public&connection_limit=10&pool_timeout=20';

export default function globalSetup(): void {
  const url = process.env.DATABASE_URL ?? DEFAULT_TEST_URL;

  // Guarda de seguranca: os testes rodam TRUNCATE ... CASCADE entre casos. Se o
  // DATABASE_URL apontar pro banco de desenvolvimento, isso apaga tudo. Exigir
  // "test" no nome e barato e impede o acidente.
  const database = new URL(url).pathname.replace('/', '');

  if (!database.includes('test')) {
    throw new Error(
      `Teste de integracao recusado: DATABASE_URL aponta para "${database}", ` +
        'que nao parece um banco de teste. Suba o banco com ' +
        '"pnpm --filter @excursion-trip/backend db:test:up".',
    );
  }

  process.env.DATABASE_URL = url;

  // `migrate deploy` (e nao `db push`): valida que as migrations aplicam limpo
  // em sequencia, que e o que roda em producao. Idempotente — em banco ja
  // migrado sai em ~200ms.
  execSync('pnpm exec prisma migrate deploy', {
    cwd: BACKEND_ROOT,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
