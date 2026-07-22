/*
  Warnings:

  - Added the required column `state` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UF" AS ENUM ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO');

-- AlterTable
-- Backfill temporário pras 3 linhas existentes (dados de teste), sem default permanente no schema
ALTER TABLE "Event" ADD COLUMN     "state" "UF" NOT NULL DEFAULT 'SP';
ALTER TABLE "Event" ALTER COLUMN "state" DROP DEFAULT;
