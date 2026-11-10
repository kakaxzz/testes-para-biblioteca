import nodemailer from "nodemailer"

const REMETENTE = process.env.GMAIL_USER || "lightyearsystemscontato@gmail.com"

function criarTransporte() {
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!pass) {
    throw new Error(
      "GMAIL_APP_PASSWORD não configurado. Gere uma 'Senha de app' na conta do Gmail e defina essa variável."
    )
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: REMETENTE, pass: pass.replace(/\s/g, "") },
  })
}

export async function enviarEmailRecuperacao(para: string, link: string, validadeMinutos: number) {
  const transporte = criarTransporte()

  const texto = [
    "Olá!",
    "",
    "Recebemos um pedido para redefinir a senha da Área Admin da Biblioteca Escolar Emerson Teixeira.",
    `Use o link abaixo para criar uma nova senha (válido por ${validadeMinutos} minutos e de uso único):`,
    "",
    link,
    "",
    "Se você não fez esse pedido, ignore este e-mail: sua senha atual continua a mesma.",
  ].join("\n")

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4ede3;padding:32px 16px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;color:#261111;">
      <h1 style="font-family:Georgia,serif;font-size:24px;color:#8b1e1e;margin:0 0 4px;">Redefinição de senha</h1>
      <p style="font-size:13px;color:#9b8f8f;margin:0 0 24px;">Biblioteca Escolar Emerson Teixeira</p>
      <p style="font-size:15px;line-height:1.5;">Recebemos um pedido para redefinir a senha da <strong>Área Admin</strong>.</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${link}" style="background:#8b1e1e;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:12px;display:inline-block;">Criar nova senha</a>
      </p>
      <p style="font-size:13px;line-height:1.5;color:#6b5757;">O link vale por ${validadeMinutos} minutos e só pode ser usado uma vez. Se o botão não funcionar, copie e cole este endereço no navegador:</p>
      <p style="font-size:12px;word-break:break-all;color:#6b5757;">${link}</p>
      <hr style="border:none;border-top:1px solid #efe2df;margin:24px 0;" />
      <p style="font-size:12px;color:#9b8f8f;">Se você não fez esse pedido, ignore este e-mail: sua senha atual continua a mesma.</p>
    </div>
  </div>`

  await transporte.sendMail({
    from: `"Biblioteca Escolar Emerson Teixeira" <${REMETENTE}>`,
    to: para,
    subject: "Redefinição de senha – Área Admin da Biblioteca",
    text: texto,
    html,
  })
}
