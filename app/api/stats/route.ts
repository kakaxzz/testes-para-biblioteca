import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [livros, alunos, emprestimos, emaberto] = await Promise.all([
      prisma.livro.count(),
      prisma.aluno.count(),
      prisma.emprestimo.count(),
      prisma.emprestimo.count({ where: { dataDevolucao: null } }),
    ])
    return NextResponse.json({ livros, alunos, emprestimos, emaberto })
  } catch {
    return NextResponse.json({ livros: 0, alunos: 0, emprestimos: 0, emaberto: 0 })
  }
}
