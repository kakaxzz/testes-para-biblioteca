-- 1. Cria o enum de tipos de usuário
CREATE TYPE "TipoUsuario" AS ENUM ('ALUNO', 'FUNCIONARIO', 'RESPONSAVEL');

-- 2. Renomeia a tabela Aluno para Usuario
ALTER TABLE "Aluno" RENAME TO "Usuario";

-- 3. Renomeia a constraint de chave primária (cosmético, mas evita confusão futura)
ALTER TABLE "Usuario" RENAME CONSTRAINT "Aluno_pkey" TO "Usuario_pkey";

-- 4. Renomeia o índice único da matrícula
ALTER INDEX "Aluno_matricula_key" RENAME TO "Usuario_matricula_key";

-- 5. Adiciona a coluna tipo (todos os existentes viram ALUNO por padrão)
ALTER TABLE "Usuario" ADD COLUMN "tipo" "TipoUsuario" NOT NULL DEFAULT 'ALUNO';

-- 6. Adiciona a coluna cpf (opcional, ninguém tem ainda)
ALTER TABLE "Usuario" ADD COLUMN "cpf" TEXT;
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- 7. Torna matricula opcional (antes era obrigatória)
ALTER TABLE "Usuario" ALTER COLUMN "matricula" DROP NOT NULL;

-- 8. Renomeia a coluna alunoId para usuarioId na tabela Emprestimo
ALTER TABLE "Emprestimo" RENAME COLUMN "alunoId" TO "usuarioId";

-- 9. Renomeia a foreign key correspondente
ALTER TABLE "Emprestimo" RENAME CONSTRAINT "Emprestimo_alunoId_fkey" TO "Emprestimo_usuarioId_fkey";