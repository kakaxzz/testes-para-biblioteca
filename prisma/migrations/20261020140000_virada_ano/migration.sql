-- CreateTable
CREATE TABLE "Virada" (
    "ano" INTEGER NOT NULL,
    "executadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promovidos" INTEGER NOT NULL DEFAULT 0,
    "removidos" INTEGER NOT NULL DEFAULT 0,
    "pendentes" INTEGER NOT NULL DEFAULT 0,
    "estatisticas" JSONB NOT NULL,

    CONSTRAINT "Virada_pkey" PRIMARY KEY ("ano")
);
