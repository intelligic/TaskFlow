import nodemailer from "nodemailer";

const parseFrom = (value) => {
  if (!value) return { name: "TaskFlow", email: "" };
  const match = String(value).match(/^(.*)<([^>]+)>$/);
  if (match) {
    return { name: match[1].trim() || "TaskFlow", email: match[2].trim() };
  }
  return { name: "TaskFlow", email: String(value).trim() };
};

const sendWithBrevo = async ({ to, subject, html, replyTo }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || "";
  const sender = parseFrom(emailFrom);
  if (!sender.email) throw new Error("EMAIL_FROM is required to send emails");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: sender.name, email: sender.email },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        replyTo: replyTo ? { email: replyTo } : undefined,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Brevo API error (${res.status})`);
    }
    return true;
  } finally {
    clearTimeout(timeout);
  }
};

let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing)");
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return cachedTransporter;
};

export const sendEmail = async (to, subject, html, options = {}) => {
  // Prefer Brevo API if API key is configured (more reliable on cloud hosts).
  const usedBrevo = await sendWithBrevo({
    to,
    subject,
    html,
    replyTo: options.replyTo || undefined,
  });
  if (usedBrevo) return;

  const transporter = getTransporter();
  const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!emailFrom) throw new Error("EMAIL_FROM or SMTP_USER is required to send emails");

  const from = emailFrom.includes("<") ? emailFrom : `TaskFlow <${emailFrom}>`;

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    replyTo: options.replyTo || undefined,
  });
};
