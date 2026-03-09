import nodemailer from "nodemailer";
import { createLogger } from "@/lib/logger";

const log = createLogger("email");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
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

export function generateVerificationEmailHtml(url: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>验证您的邮箱地址</h1>
        <p>您好，${userName}！</p>
        <p>感谢您注册。请点击下方按钮验证您的邮箱地址：</p>
        <p>
          <a href="${url}" class="button">验证邮箱</a>
        </p>
        <p>或者复制以下链接到浏览器：</p>
        <p style="word-break: break-all; color: #666;">${url}</p>
        <p>此链接将在 24 小时后过期。</p>
        <div class="footer">
          <p>如果您没有注册此账户，请忽略此邮件。</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateResetPasswordEmailHtml(url: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>重置您的密码</h1>
        <p>您好，${userName}！</p>
        <p>我们收到了重置您账户密码的请求。请点击下方按钮设置新密码：</p>
        <p>
          <a href="${url}" class="button">重置密码</a>
        </p>
        <p>或者复制以下链接到浏览器：</p>
        <p style="word-break: break-all; color: #666;">${url}</p>
        <p>此链接将在 1 小时后过期。</p>
        <div class="footer">
          <p>如果您没有请求重置密码，请忽略此邮件，您的密码不会被更改。</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
