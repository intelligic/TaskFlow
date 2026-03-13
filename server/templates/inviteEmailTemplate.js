export const inviteEmailTemplate = ({ inviteLink, adminName, workspaceName }) => {
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
                You're invited to join a workspace
              </h2>

              <p style="color:#475569;font-size:15px;margin:18px 0 0">
                Hello,
              </p>

              <p style="color:#475569;font-size:15px;line-height:1.6;margin:10px 0 0">
                <strong>${adminName}</strong> has invited you to join the
                <strong>"${workspaceName}"</strong> workspace on <strong>TaskFlow</strong>.
              </p>

              <p style="color:#475569;font-size:15px;line-height:1.6;margin:14px 0 0">
                Click the button below to activate your account and set your password.
              </p>

              <a href="${inviteLink}"
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
                Activate Account
              </a>

              <p style="margin:18px 0 0;color:#64748b;font-size:13px">
                This link will expire in 24 hours for security reasons.
              </p>

              <hr style="margin:30px 0;border:none;border-top:1px solid #eee">

              <p style="font-size:13px;color:#94a3b8;margin:0">
                TaskFlow - Smart Task Management for Teams
              </p>
              <p style="font-size:12px;color:#94a3b8;margin:8px 0 0">
                If you did not request this invitation, you can safely ignore this email.
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
