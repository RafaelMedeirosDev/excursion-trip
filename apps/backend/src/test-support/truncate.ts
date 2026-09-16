import { PrismaClient } from '@prisma/client';

/**
 * TRUNCATE de todas as tabelas do schema public, descobertas do catalogo em vez
 * de listadas a mao — model novo no schema.prisma nao exige editar este arquivo.
 *
 * `_prisma_migrations` fica de fora de proposito: truncá-la faria o
 * `migrate deploy` do proximo run tentar reaplicar tudo num banco que ja tem as
 * tabelas, e falhar.
 *
 * CASCADE resolve as FKs sem precisar de ordem topologica.
 */
export async function truncateAll(prisma: PrismaClient): Promise<void> {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;

  if (tables.length === 0) {
    return;
  }

  const list = tables.map((table) => `"public"."${table.tablename}"`).join(', ');

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`,
  );
}
