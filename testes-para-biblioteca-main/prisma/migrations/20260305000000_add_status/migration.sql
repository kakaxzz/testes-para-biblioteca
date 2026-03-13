-- Adiciona o campo 'status' na tabela Livro
-- Valor padrão: 'disponivel'
ALTER TABLE "Livro" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'disponivel';
