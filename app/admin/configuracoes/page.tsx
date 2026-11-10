import { TrocarSenhaForm } from "@/components/admin/TrocarSenhaForm"
import { EmailRecuperacaoForm } from "@/components/admin/EmailRecuperacaoForm"
import { TrocarUsuarioForm } from "@/components/admin/TrocarUsuarioForm"
import { ViradaAno } from "@/components/admin/ViradaAno"

export default function AdminConfiguracoes() {
  return (
    <>
      <div className="page-header">
        <h1>Configurações</h1>
        <p>Usuário, senha e e-mail de recuperação do painel, e virada de ano das turmas</p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="grid gap-6">
          <TrocarUsuarioForm />
          <TrocarSenhaForm />
          <EmailRecuperacaoForm />
        </div>
        <ViradaAno />
      </div>
    </>
  )
}
