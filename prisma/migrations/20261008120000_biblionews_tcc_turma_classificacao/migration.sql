-- Migration idempotente: pode rodar com segurança mesmo se alguma coluna/tabela já existir no banco.

-- Classificação indicativa dos livros
ALTER TABLE "Livro" ADD COLUMN IF NOT EXISTS "classificacaoIndicativa" TEXT;

-- Turma do aluno
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "turma" TEXT;

-- Registro de autorização do responsável no empréstimo
ALTER TABLE "Emprestimo" ADD COLUMN IF NOT EXISTS "autorizacaoResponsavel" BOOLEAN NOT NULL DEFAULT false;

-- PDFs de TCC/artigos guardados no banco (o disco da Vercel é somente leitura)
CREATE TABLE IF NOT EXISTS "TccArquivo" (
    "id" SERIAL NOT NULL,
    "tccId" INTEGER NOT NULL,
    "dados" BYTEA NOT NULL,
    CONSTRAINT "TccArquivo_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TccArquivo_tccId_key" ON "TccArquivo"("tccId");
DO $$ BEGIN
  ALTER TABLE "TccArquivo" ADD CONSTRAINT "TccArquivo_tccId_fkey"
    FOREIGN KEY ("tccId") REFERENCES "Tcc"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Avisos do BiblioNews (antes ficavam em data/biblionews.json)
CREATE TABLE IF NOT EXISTS "Aviso" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tag" TEXT NOT NULL DEFAULT '',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- Aproveita os avisos que já existiam no JSON (só se a tabela estiver vazia)
INSERT INTO "Aviso" ("titulo", "mensagem", "tag", "ordem")
SELECT v.titulo, v.mensagem, v.tag, v.ordem FROM (VALUES
  ('O Livro do Mês', 'O livro do mês do nosso Clube do Livro é Noites Brancas, de Fiódor Dostoiévski!', 'Clube do Livro', 0),
  ('Data do Próximo Encontro', 'A Data definida para o próximo encontro do Clube do Livro é dia 30/04, Quinta-Feira às 15:30', 'Clube do Livro', 1),
  ('Horário de atendimento', 'A biblioteca funciona de segunda a sexta, das 8h às 17h, com hora do estudo às 14h.', 'Aviso', 2),
  ('Novo Mascote!', 'Conheçam o mais novo mascote da nossa comunidade escolar, o Sr. Papiro! Ele também vive no cantinho do chat, ali no canto da tela, prontinho pra indicar um livro pra você.', 'Novo Mascote', 3)
) AS v(titulo, mensagem, tag, ordem)
WHERE NOT EXISTS (SELECT 1 FROM "Aviso");
