import nodemailer from "nodemailer";
import { createLogger } from "@/lib/logger";
import { getServices, getSmtpConfig } from "@/lib/capability";

const log = createLogger("smtp");

let _transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (!_transporter) {
    const services = await getServices();
    const smtp = getSmtpConfig(services);
    log.info("Initializing SMTP transporter", { host: smtp.host });
    _transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });
  }
  return _transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const services = await getServices();
    const smtp = getSmtpConfig(services);
    const info = await (await getTransporter()).sendMail({
      from: smtp.from || smtp.user,
      to,
      subject,
      html,
      text,
    });
    log.info("Email sent", { to, subject, messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    log.error("Failed to send email", { to, subject, error });
    return { success: false, error };
  }
}
