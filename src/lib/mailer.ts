import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export type MailPayload = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  /** Reply-To (p. ej. el email del cliente en avisos internos). Nunca cambia el From. */
  replyTo?: string;
};

let transporter: Transporter | null = null;

function env(name: string, fallback = "") {
  return (process.env[name] ?? fallback).trim();
}

/** Remitente fijo: siempre noreply (o lo definido en SMTP_FROM_*). */
export function getFromAddress() {
  const email = env("SMTP_FROM_EMAIL", env("SMTP_USER", "noreply@gdtdevsur.cl"));
  const name = env("SMTP_FROM_NAME", "Grupo Desarrollo Tecnológico Devsur");
  return { name, address: email };
}

export function isMailConfigured() {
  return Boolean(env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS"));
}

function getTransporter() {
  if (!isMailConfigured()) return null;
  if (transporter) return transporter;

  const port = Number(env("SMTP_PORT", "465")) || 465;
  const secure =
    env("SMTP_SECURE", port === 465 ? "true" : "false").toLowerCase() === "true";

  transporter = nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure,
    auth: {
      user: env("SMTP_USER"),
      pass: env("SMTP_PASS"),
    },
  });
  return transporter;
}

/**
 * Envía un correo. El From siempre es SMTP_FROM_* (noreply).
 * Si SMTP no está configurado, no hace nada y devuelve false.
 */
export async function sendMail(payload: MailPayload): Promise<boolean> {
  const tx = getTransporter();
  if (!tx) return false;

  const from = getFromAddress();
  await tx.sendMail({
    from: `"${from.name.replace(/"/g, "")}" <${from.address}>`,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    replyTo: payload.replyTo,
  });
  return true;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Destinos de aviso interno (nuevos mensajes del formulario). */
export function getNotifyAddresses(): string[] {
  const raw = env("SMTP_NOTIFY_TO");
  if (raw) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return ["nfigueroa@gdtdevsur.cl"];
}

export type ContactMailInput = {
  name: string;
  phone: string;
  email: string;
  company?: string;
  message: string;
};

/** Aviso al equipo + confirmación al cliente. From siempre noreply. */
export async function sendContactEmails(input: ContactMailInput) {
  if (!isMailConfigured()) return { notified: false, confirmed: false };

  const notifyTo = getNotifyAddresses();
  const brand = getFromAddress().name;
  const company = input.company?.trim() || "—";

  const adminText = [
    "Nuevo mensaje desde el formulario de contacto",
    "",
    `Nombre: ${input.name}`,
    `Teléfono: ${input.phone}`,
    `Email: ${input.email}`,
    `Empresa: ${company}`,
    "",
    "Mensaje:",
    input.message,
  ].join("\n");

  const adminHtml = `
    <p><strong>Nuevo mensaje desde el formulario de contacto</strong></p>
    <ul>
      <li><strong>Nombre:</strong> ${escapeHtml(input.name)}</li>
      <li><strong>Teléfono:</strong> ${escapeHtml(input.phone)}</li>
      <li><strong>Email:</strong> ${escapeHtml(input.email)}</li>
      <li><strong>Empresa:</strong> ${escapeHtml(company)}</li>
    </ul>
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>
  `;

  const clientText = [
    `Hola ${input.name},`,
    "",
    `Recibimos tu mensaje en ${brand}. Te responderemos a la brevedad.`,
    "",
    "Resumen de lo que nos enviaste:",
    input.message,
    "",
    "Este correo es automático; no respondas a esta dirección.",
    "",
    brand,
  ].join("\n");

  const clientHtml = `
    <p>Hola ${escapeHtml(input.name)},</p>
    <p>Recibimos tu mensaje en <strong>${escapeHtml(brand)}</strong>. Te responderemos a la brevedad.</p>
    <p><strong>Resumen de lo que nos enviaste:</strong></p>
    <p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>
    <p style="color:#666;font-size:13px">Este correo es automático; no respondas a esta dirección.</p>
    <p>${escapeHtml(brand)}</p>
  `;

  let notified = false;
  let confirmed = false;

  try {
    if (notifyTo.length) {
      notified = await sendMail({
        to: notifyTo,
        subject: `Nuevo contacto: ${input.name}`,
        text: adminText,
        html: adminHtml,
        replyTo: input.email,
      });
    }
  } catch (err) {
    console.error("[mailer] aviso interno falló:", err);
  }

  try {
    confirmed = await sendMail({
      to: input.email,
      subject: `Recibimos tu mensaje — ${brand}`,
      text: clientText,
      html: clientHtml,
    });
  } catch (err) {
    console.error("[mailer] confirmación al cliente falló:", err);
  }

  return { notified, confirmed };
}
