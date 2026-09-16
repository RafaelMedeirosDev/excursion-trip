import { PrismaRemoteRepository } from 'src/external/repositories/remote/PrismaRemoteRepository';

/**
 * Usa a MESMA classe do runtime de producao de proposito: e ela que os
 * Prisma*Repository recebem no construtor. Fora do container do Nest o
 * onModuleInit nao roda, entao a conexao e o disconnect ficam por conta de quem
 * cria.
 */
export async function createTestClient(): Promise<PrismaRemoteRepository> {
  const client = new PrismaRemoteRepository({
    log: process.env.PRISMA_LOG ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

  await client.$connect();

  return client;
}
