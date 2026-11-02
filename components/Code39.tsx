// Código de barras Code 39 em SVG (usado nas etiquetas do acervo).
// n = elemento estreito, w = largo; posições pares são barras, ímpares são espaços.
const PADROES: Record<string, string> = {
  "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nwnwnnnnw", "3": "wwnwnnnnn", "4": "nnnwwnnnw",
  "5": "wnnwwnnnn", "6": "nwnwwnnnn", "7": "nnnwnnwnw", "8": "wnnwnnwnn", "9": "nwnwnnwnn",
  "*": "nwnnwnwnn",
}

const peso = (parte: string) => (parte === "n" ? 1 : 2)

export function Code39({ valor, largura = 130, altura = 34 }: { valor: string; largura?: number; altura?: number }) {
  const padroes = `*${String(valor || "").toUpperCase()}*`.split("").map((c) => PADROES[c] ?? PADROES["0"])

  // largura total em "unidades" (+1 de espaço entre caracteres, menos o último)
  const unidades = padroes.reduce((total, p) => total + [...p].reduce((soma, parte) => soma + peso(parte), 0) + 1, -1)
  const escala = largura / unidades

  let x = 0
  const barras: React.ReactElement[] = []
  padroes.forEach((padrao, i) => {
    ;[...padrao].forEach((parte, j) => {
      const w = peso(parte) * escala
      if (j % 2 === 0) barras.push(<rect key={`${i}-${j}`} x={x} y={0} width={w} height={altura} fill="#000" />)
      x += w
    })
    x += escala
  })

  return (
    <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`} role="img" aria-label={`Código de barras ${valor}`}>
      {barras}
    </svg>
  )
}
