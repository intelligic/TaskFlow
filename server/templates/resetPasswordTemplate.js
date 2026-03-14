export const resetPasswordTemplate = ({ resetLink, userName }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#0f172a">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" style="background:#ffffff;border-radius:12px;padding:36px 40px;margin:40px 16px 24px;box-shadow:0 6px 24px rgba(15,23,42,0.08)">
          <tr>
            <td align="center">
              <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:#e7f0ff;color:#2563eb;font-weight:700;letter-spacing:0.3px;font-size:13px">
                TaskFlow
              </div>
              <h2 style="margin:20px 0 0;color:#0f172a;font-size:22px">
                Password Reset Request
              </h2>
              <p style="color:#475569;font-size:15px;margin:18px 0 0">
                Hello ${userName},
              </p>
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:10px 0 0">
                We received a request to reset your password. Click the button below to choose a new one:
              </p>
              <a href="${resetLink}"
                style="
                display:inline-block;
                margin-top:22px;
                padding:12px 30px;
                background:#2563eb;
                color:white;
                text-decoration:none;
                border-radius:6px;
                font-weight:bold;
                font-size:14px;
                ">
                Reset Password
              </a>
              <p style="margin:18px 0 0;color:#64748b;font-size:13px">
                This link will expire in 1 hour. If you didn't request a reset, you can safely ignore this email.
              </p>
              <hr style="margin:30px 0;border:none;border-top:1px solid #eee">
              <p style="font-size:13px;color:#94a3b8;margin:0">
                TaskFlow - Smart Task Management for Teams
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  </body>
  </html>
  `;
};
