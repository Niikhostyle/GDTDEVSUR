/**
 * Prueba de conexión y envío SMTP (From = noreply).
 * Uso: node --env-file=.env scripts/test-smtp.mjs [destino]
 */
import nodemailer from "nodemailer";

const to = process.argv[2] || process.env.SMTP_NOTIFY_TO || "nfigueroa@gdtdevsur.cl";
const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 465);
const secure = String(process.env.SMTP_SECURE ?? "true").toLowerCase() === "true";
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const fromEmail = process.env.SMTP_FROM_EMAIL || user;
const fromName = process.env.SMTP_FROM_NAME || "GDT DevSur";

if (!host || !user || !pass) {
  console.error("Falta SMTP_HOST / SMTP_USER / SMTP_PASS en .env");
  process.exit(1);
}

const tx = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
});

console.log(`Verificando ${host}:${port} (secure=${secure}) como ${user}…`);
await tx.verify();
console.log("SMTP OK. Enviando prueba a", to);

const info = await tx.sendMail({
  from: `"${fromName}" <${fromEmail}>`,
  to,
  subject: "Prueba SMTP GDT DevSur (noreply)",
  text: `Correo de prueba enviado desde ${fromEmail} el ${new Date().toISOString()}.`,
  html: `<p>Correo de prueba enviado desde <strong>${fromEmail}</strong>.</p><p>${new Date().toISOString()}</p>`,
});

console.log("Enviado:", info.messageId);
process.exit(0);
