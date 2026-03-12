export const inviteEmailTemplate = (inviteLink) => {
  return `
  <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:40px">
    
    <div style="max-width:600px;margin:auto;background:white;border-radius:8px;padding:30px">
      
      <h2 style="color:#111">Welcome to Task Management System</h2>

      <p>Hello,</p>

      <p>
        You have been invited to join the company workspace.
      </p>

      <p>
        Click the button below to activate your account and set your password.
      </p>

      <a href="${inviteLink}" 
      style="
      display:inline-block;
      margin-top:15px;
      padding:12px 20px;
      background:#2563eb;
      color:white;
      text-decoration:none;
      border-radius:6px;
      ">
      Activate Account
      </a>

      <p style="margin-top:20px;color:#555">
      This link will expire in 24 hours.
      </p>

      <hr style="margin:30px 0"/>

      <p style="font-size:12px;color:#777">
      Task Management System
      </p>

    </div>

  </div>
  `;
};