-- Migration idempotente: pode rodar com segurança mesmo se alguma coluna/tabela já existir no banco.

-- Data exibida em cada aviso do BiblioNews
ALTER TABLE "Aviso" ADD COLUMN IF NOT EXISTS "data" TIMESTAMP(3);

-- Imagem de cada aviso (guardada no banco, como os PDFs dos TCCs)
CREATE TABLE IF NOT EXISTS "AvisoImagem" (
    "id" SERIAL NOT NULL,
    "avisoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "dados" BYTEA NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvisoImagem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AvisoImagem_avisoId_key" ON "AvisoImagem"("avisoId");
DO $$ BEGIN
  ALTER TABLE "AvisoImagem" ADD CONSTRAINT "AvisoImagem_avisoId_fkey"
    FOREIGN KEY ("avisoId") REFERENCES "Aviso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
