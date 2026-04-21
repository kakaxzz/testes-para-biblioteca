/*
  Warnings:

  - You are about to drop the column `livroId` on the `Emprestimo` table. All the data in the column will be lost.
  - You are about to drop the column `quantidadeTotal` on the `Livro` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Livro` table. All the data in the column will be lost.
  - You are about to drop the column `tombo` on the `Livro` table. All the data in the column will be lost.
  - Added the required column `exemplarId` to the `Emprestimo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Exemplar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "livroId" INTEGER NOT NULL,
    "tombo" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disponivel',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Exemplar_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Emprestimo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alunoId" INTEGER NOT NULL,
    "exemplarId" INTEGER NOT NULL,
    "dataEmprestimo" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataDevolucao" DATETIME,
    CONSTRAINT "Emprestimo_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Emprestimo_exemplarId_fkey" FOREIGN KEY ("exemplarId") REFERENCES "Exemplar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Emprestimo" ("alunoId", "dataDevolucao", "dataEmprestimo", "id") SELECT "alunoId", "dataDevolucao", "dataEmprestimo", "id" FROM "Emprestimo";
DROP TABLE "Emprestimo";
ALTER TABLE "new_Emprestimo" RENAME TO "Emprestimo";
CREATE TABLE "new_Livro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "sinopse" TEXT,
    "capa" TEXT,
    "assuntos" TEXT,
    "editora" TEXT,
    "edicao" TEXT,
    "volume" TEXT,
    "cdd" TEXT,
    "cutter" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Livro" ("assuntos", "autor", "capa", "cdd", "criadoEm", "cutter", "edicao", "editora", "id", "isbn", "sinopse", "titulo", "volume") SELECT "assuntos", "autor", "capa", "cdd", "criadoEm", "cutter", "edicao", "editora", "id", "isbn", "sinopse", "titulo", "volume" FROM "Livro";
DROP TABLE "Livro";
ALTER TABLE "new_Livro" RENAME TO "Livro";
CREATE UNIQUE INDEX "Livro_isbn_key" ON "Livro"("isbn");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Exemplar_tombo_key" ON "Exemplar"("tombo");
