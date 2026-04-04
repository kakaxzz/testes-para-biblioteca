export const runtime = "nodejs"

import { NextResponse } from "next/server"

// LOGS DE DEPURAÇÃO
console.log('🔍 ===== INICIANDO ROTA ISBN =====');
console.log('📝 Verificando variáveis de ambiente:');
console.log('GOOGLE_BOOKS_API_KEY existe?', !!process.env.GOOGLE_BOOKS_API_KEY);
console.log('GOOGLE_BOOKS_API_KEY (primeiros 5 caracteres):', process.env.GOOGLE_BOOKS_API_KEY?.substring(0, 5));
console.log('DATABASE_URL existe?', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 ===== FIM LOGS INICIAIS =====');


export async function GET(
  request: Request,
  context: { params: Promise<{ isbn: string }> }
) {

  const { isbn } = await context.params
  const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY

  console.log(`\n📚 Buscando ISBN: ${isbn}`);
  console.log('🔑 API Key presente?', !!GOOGLE_BOOKS_API_KEY);


  if (!GOOGLE_BOOKS_API_KEY) {

    console.error("❌ API KEY NÃO ENCONTRADA");

    return NextResponse.json(
      {
        error: "API key não configurada"
      },
      { status: 500 }
    )

  }


  try {

    let googleData: any = null
    let brasilData: any = null


    // =========================
    // 1️⃣ GOOGLE BOOKS
    // =========================

    try {

      console.log('🌐 Google Books...');

      const url =
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${GOOGLE_BOOKS_API_KEY}`

      const googleResponse = await fetch(url)

      const googleJson = await googleResponse.json()


      if (googleJson.totalItems > 0) {

        const volumeInfo =
          googleJson.items[0].volumeInfo


        const identifiers =
          volumeInfo.industryIdentifiers || []


        const isbnEncontrado =
          identifiers.some(
            (id: any) =>
              id.identifier === isbn
          )


        if (isbnEncontrado) {

          googleData =
            volumeInfo

          console.log("✅ Google OK")

        }

      }

    } catch (error) {

      console.log("Erro Google:", error)

    }



    // =========================
    // 2️⃣ BRASIL API
    // =========================

    if (!googleData) {

      try {

        console.log('🌐 BrasilAPI...');

        const response =
          await fetch(
            `https://brasilapi.com.br/api/isbn/v1/${isbn}?providers=cbl`
          )


        if (response.ok) {

          brasilData =
            await response.json()

          console.log("✅ BrasilAPI OK")

        }

      } catch (error) {

        console.log("Erro BrasilAPI:", error)

      }

    }



    // =========================
    // NADA ENCONTRADO
    // =========================

    if (!googleData && !brasilData) {

      return NextResponse.json(
        { error: "Livro não encontrado" },
        { status: 404 }
      )

    }



    // =========================
    // DADOS
    // =========================

    const titulo =

      googleData?.title ||
      brasilData?.title ||
      "Título desconhecido"



    const autor =

      googleData?.authors?.join(", ") ||
      brasilData?.authors?.join(", ") ||
      "Autor desconhecido"



    const sinopse =

      googleData?.description ||
      brasilData?.synopsis ||
      ""



    const paginas =

      googleData?.pageCount ||
      brasilData?.page_count ||
      0



    const assuntos =

      googleData?.categories ||
      brasilData?.subjects ||
      []



    // =========================
    // CAPA INTELIGENTE
    // =========================

    const capaGoogle =
      googleData?.imageLinks?.thumbnail?.replace("http://", "https://")


    const capaOpenLibrary =
      `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`


    let capaFinal: string | null =
      capaGoogle || null


    // testa OpenLibrary só se não tiver Google

    if (!capaFinal) {

      try {

        const teste =
          await fetch(
            capaOpenLibrary,
            { method: "HEAD" }
          )


        if (teste.ok) {

          capaFinal =
            capaOpenLibrary

          console.log("✅ OpenLibrary OK")

        }

      } catch {

        console.log("Sem capa OpenLibrary")

      }

    }



    // se nenhuma capa existir

    const capa =
      capaFinal



    // =========================
    // RESULTADO
    // =========================

    const resultado = {

      titulo,
      autor,
      paginas,
      sinopse,
      assuntos,
      capa,
      isbn,

    }


    console.log("✅ RESULTADO:", resultado)


    return NextResponse.json(
      resultado
    )



  } catch (error) {


    console.error(
      "❌ Erro geral:",
      error
    )


    return NextResponse.json(

      {
        error:
          "Erro ao buscar livro"
      },

      { status: 500 }

    )

  }

}