import nodemailer from "nodemailer";

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
  });

  return cachedTransporter;
};

export const sendEmail = async (to, subject, html, options = {}) => {
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
