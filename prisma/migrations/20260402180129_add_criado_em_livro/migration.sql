-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Livro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "sinopse" TEXT,
    "capa" TEXT,
    "assuntos" TEXT,
    "quantidadeTotal" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'disponivel',
    "tombo" INTEGER,
    "cutter" TEXT,
    "cdd" TEXT,
    "editora" TEXT,
    "edicao" TEXT,
    "volume" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Livro" ("assuntos", "autor", "capa", "cdd", "cutter", "edicao", "editora", "id", "isbn", "quantidadeTotal", "sinopse", "status", "titulo", "tombo", "volume") SELECT "assuntos", "autor", "capa", "cdd", "cutter", "edicao", "editora", "id", "isbn", "quantidadeTotal", "sinopse", "status", "titulo", "tombo", "volume" FROM "Livro";
DROP TABLE "Livro";
ALTER TABLE "new_Livro" RENAME TO "Livro";
CREATE UNIQUE INDEX "Livro_isbn_key" ON "Livro"("isbn");
CREATE UNIQUE INDEX "Livro_tombo_key" ON "Livro"("tombo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
