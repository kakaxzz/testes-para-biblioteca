"use client"

import { CategoriasSelect } from "@/components/CategoriaSelect"
import { ClassificacaoSelect } from "@/components/ClassificacaoSelect"

export type CamposLivro = {
  titulo: string
  autor: string
  editora: string
  cdd: string
  cutter: string
  edicao: string
  volume: string
  classificacaoIndicativa: string
  categorias: string[]
  sinopse: string
  capa: string
}

export const CAMPOS_VAZIOS: CamposLivro = {
  titulo: "", autor: "", editora: "", cdd: "", cutter: "", edicao: "", volume: "",
  classificacaoIndicativa: "", categorias: [], sinopse: "", capa: "",
}

// Converte o livro que vem da API (campos podem ser null) para os campos do formulário
export function camposDoLivro(l: any): CamposLivro {
  return {
    titulo: l.titulo ?? "",
    autor: l.autor ?? "",
    editora: l.editora ?? "",
    cdd: l.cdd ?? "",
    cutter: l.cutter ?? "",
    edicao: l.edicao ?? "",
    volume: l.volume ?? "",
    classificacaoIndicativa: l.classificacaoIndicativa ?? "",
    categorias: l.assuntos ? l.assuntos.split(",").map((c: string) => c.trim()).filter(Boolean) : [],
    sinopse: l.sinopse ?? "",
    capa: l.capa ?? "",
  }
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="input-group">
      <label>{rotulo}</label>
      {children}
    </div>
  )
}

type Props = {
  valores: CamposLivro
  onChange: (parcial: Partial<CamposLivro>) => void
  comTitulo?: boolean
}

// Formulário do livro, usado tanto no cadastro quanto na edição
export function LivroCampos({ valores, onChange, comTitulo = false }: Props) {
  const texto = (campo: Exclude<keyof CamposLivro, "categorias">, placeholder?: string) => (
    <input
      className="input-field"
      value={valores[campo]}
      placeholder={placeholder}
      onChange={(e) => onChange({ [campo]: e.target.value })}
    />
  )

  return (
    <>
      {comTitulo && <Campo rotulo="Título">{texto("titulo")}</Campo>}

      <div className="grid gap-x-3 sm:grid-cols-2">
        <Campo rotulo="Autor">{texto("autor")}</Campo>
        <Campo rotulo="Editora">{texto("editora")}</Campo>
      </div>

      <div className="grid grid-cols-2 gap-x-3 sm:grid-cols-4">
        <Campo rotulo="CDD">{texto("cdd", "Ex: 823.914")}</Campo>
        <Campo rotulo="Cutter">{texto("cutter", "Ex: K56c")}</Campo>
        <Campo rotulo="Edição">{texto("edicao", "Ex: 3")}</Campo>
        <Campo rotulo="Volume">{texto("volume", "Ex: 5")}</Campo>
      </div>

      <Campo rotulo="Classificação indicativa">
        <ClassificacaoSelect value={valores.classificacaoIndicativa} onChange={(v) => onChange({ classificacaoIndicativa: v })} />
      </Campo>

      <Campo rotulo="Assuntos / Categorias">
        <CategoriasSelect value={valores.categorias} onChange={(categorias) => onChange({ categorias })} />
      </Campo>

      <Campo rotulo="Sinopse">
        <textarea className="input-field" value={valores.sinopse} onChange={(e) => onChange({ sinopse: e.target.value })} />
      </Campo>

      <Campo rotulo="URL da Capa">{texto("capa")}</Campo>
    </>
  )
}
