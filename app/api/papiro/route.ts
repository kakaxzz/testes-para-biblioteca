import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { mensagens, acervo } = await request.json()

    // Monta a lista do acervo para o contexto
    const listaAcervo = acervo
      .map((l: any) => {
        const disp = l.quantidadeDisponivel > 0 ? "disponível" : "emprestado"
        return `- "${l.titulo}" de ${l.autor}${l.assuntos ? ` (${l.assuntos})` : ""} — ${disp}`
      })
      .join("\n")

    const systemPrompt = `Você é o Papiro, o jabuti mascote da Biblioteca Emerson Teixeira, da Escola João Paulo I.

Seu único objetivo é recomendar livros do acervo da biblioteca com base nos interesses do aluno.

REGRAS QUE VOCÊ DEVE SEGUIR SEMPRE:
- Seja sempre gentil, animado e acolhedor. Use linguagem simples e adequada para estudantes.
- Recomende APENAS livros que estão na lista do acervo abaixo. NUNCA invente ou sugira livros que não estão na lista.
- Se nenhum livro do acervo combinar com o interesse do aluno, diga isso com gentileza e sugira explorar outros temas.
- Se o aluno perguntar algo que não seja sobre livros ou leitura, responda educadamente que você só pode ajudar com indicações de livros.
- NUNCA fale sobre assuntos inapropriados, política, religião, ou qualquer tema polêmico.
- NUNCA critique alunos, professores, a escola ou qualquer pessoa.
- Mantenha as respostas curtas — no máximo 3 parágrafos.
- Sempre que recomendar um livro, mencione se está disponível ou emprestado.

ACERVO ATUAL DA BIBLIOTECA:
${listaAcervo}

Lembre-se: você é um jabuti simpático chamado Papiro. Pode usar emojis com moderação. 🐢`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: systemPrompt,
        messages: mensagens.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Erro Claude API:", data)
      return NextResponse.json({ resposta: "Ops! Tive um probleminha aqui. Tenta de novo em instantes! 🐢" })
    }

    const resposta = data.content?.[0]?.text ?? "Não consegui pensar em uma resposta agora. Tenta de novo!"

    return NextResponse.json({ resposta })
  } catch (error: any) {
    console.error("Erro rota Papiro:", error)
    return NextResponse.json({ resposta: "Ops! Tive um probleminha aqui. Tenta de novo em instantes! 🐢" })
  }
}