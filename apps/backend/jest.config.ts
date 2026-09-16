import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  // `.int-spec.ts` ja nao casa com o testRegex acima (ele exige um "."
  // antes de "spec"), mas o ignore e explicito de proposito: se alguem
  // renomear um teste de integracao para `.integration.spec.ts`, ele passaria
  // a ser capturado aqui e o CI unitario quebraria tentando abrir conexao.
  testPathIgnorePatterns: ['/node_modules/', '\\-spec\\.ts$', '/test-support/'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
};

export default config;
