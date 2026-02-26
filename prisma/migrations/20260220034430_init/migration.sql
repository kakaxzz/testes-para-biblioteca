-- CreateTable
CREATE TABLE "Livro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "isbn" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Livro_isbn_key" ON "Livro"("isbn");
