/*
  Warnings:

  - A unique constraint covering the columns `[tombo]` on the table `Livro` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Livro" ADD COLUMN "cdd" TEXT;
ALTER TABLE "Livro" ADD COLUMN "cutter" TEXT;
ALTER TABLE "Livro" ADD COLUMN "edicao" TEXT;
ALTER TABLE "Livro" ADD COLUMN "editora" TEXT;
ALTER TABLE "Livro" ADD COLUMN "tombo" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Livro_tombo_key" ON "Livro"("tombo");
