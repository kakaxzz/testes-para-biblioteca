import { TrocarSenhaForm } from "@/components/admin/TrocarSenhaForm"
import { ViradaAno } from "@/components/admin/ViradaAno"

export default function AdminConfiguracoes() {
  return (
    <>
      <div className="page-header">
        <h1>Configurações</h1>
        <p>Senha de acesso ao painel e virada de ano das turmas</p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <TrocarSenhaForm />
        <ViradaAno />
      </div>
    </>
  )
}
