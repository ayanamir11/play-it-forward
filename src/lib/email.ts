import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const { data, error } = await resend.emails.send({
    from: "Play It Forward <onboarding@resend.dev>",
    to: email,
    subject: "Reset your Play It Forward password",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#0A0E1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0E1A;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;">
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:24px;font-weight:700;color:#0052FF;">⚡ Play It Forward</span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#131929;border:1px solid #2A3350;border-radius:16px;padding:40px 32px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#F7F9FC;">Reset your password</h1>
              <p style="margin:0 0 32px;font-size:14px;line-height:1.6;color:#8895B3;">
                We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.
              </p>
              <a
                href="${resetUrl}"
                style="display:inline-block;background-color:#0052FF;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;"
              >
                Reset Password
              </a>
              <p style="margin:32px 0 0;font-size:12px;color:#8895B3;">
                If you didn&apos;t request a password reset, you can safely ignore this email. Your password won&apos;t change.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#4A5568;">
                &copy; 2026 Play It Forward. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });

  if (error) {
    console.error("[Resend] sendPasswordResetEmail failed:", JSON.stringify(error));
    throw new Error(`Email send failed: ${error.message}`);
  }

  console.log("[Resend] Password reset email sent, id:", data?.id);
}
