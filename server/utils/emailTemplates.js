const FEATURES = [
  "Schedule content across devices",
  "Real-time device monitoring",
  "Playlist & content library",
  "Centralized dashboard overview",
];

function baseShell({ heading, intro, ctaLabel, link, expiryNote }) {
  const featureRows = FEATURES.map(
    (f) =>
      `<tr><td style="padding:6px 0;font-size:13px;color:#1f2328;">• &nbsp;${f}</td></tr>`,
  ).join("");

  // Served by the frontend (client/public/email-logo.png); email clients
  // block SVG, so it is a PNG.
  const logoUrl = `${process.env.CLIENT_URL}/email-logo.png`;

  const html = `
<div style="background:#f6f8fa;padding:40px 20px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;border-collapse:collapse;">
    <tr>
      <td style="padding-bottom:28px;">
        <table role="presentation">
          <tr>
            <td style="width:36px;height:36px;vertical-align:middle;">
              <img src="${logoUrl}" width="36" height="36" alt="CastWise" style="display:block;border:0;" />
            </td>
            <td style="padding-left:10px;font-size:15px;font-weight:600;color:#1f2328;">CastWise</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;border:1px solid #d0d7de;border-radius:12px;padding:32px;">
        <h1 style="margin:0 0 10px;font-size:20px;color:#1f2328;">${heading}</h1>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#59636e;">${intro}</p>

        <table role="presentation" width="100%" style="margin:0 0 26px;">
          ${featureRows}
        </table>

        <table role="presentation" width="100%">
          <tr>
            <td align="center">
              <a href="${link}" style="display:inline-block;background:#1f6feb;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;">${ctaLabel}</a>
            </td>
          </tr>
        </table>

        <p style="margin:22px 0 0;font-size:12px;color:#59636e;text-align:center;">${expiryNote}</p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px;text-align:center;font-size:11px;color:#8c959f;">&copy; 2026 CastWise</td>
    </tr>
  </table>
</div>`;

  return html;
}

export function buildVerificationEmail(link) {
  const html = baseShell({
    heading: "Verify your email",
    intro:
      "You're almost ready to put your content on your screens. Confirm your email address to activate your account and get access to:",
    ctaLabel: "Verify email address",
    link,
    expiryNote:
      "This link expires in 24 hours. If you didn't create this account, you can ignore this email.",
  });

  const text = `Verify your email\n\nYou're almost ready to put your content on your screens. Confirm your email address to activate your account.\n\nWhat you get:\n${FEATURES.map((f) => `- ${f}`).join("\n")}\n\nVerify your email: ${link}\n\nThis link expires in 24 hours. If you didn't create this account, you can ignore this email.`;

  return { subject: "Verify your email", html, text };
}

export function buildResetPasswordEmail(link) {
  const html = baseShell({
    heading: "Reset your password",
    intro:
      "We received a request to reset the password on your CastWise account. Choose a new password to get back to managing your screens:",
    ctaLabel: "Reset password",
    link,
    expiryNote:
      "This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
  });

  const text = `Reset your password\n\nWe received a request to reset the password on your CastWise account.\n\nReset your password: ${link}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`;

  return { subject: "Reset your password", html, text };
}

export function buildAccountLockedEmail(link) {
  const html = baseShell({
    heading: "Account temporarily locked",
    intro:
      "We noticed 5 failed login attempts on your CastWise account. For your security, it's temporarily locked. Reset your password below to regain access:",
    ctaLabel: "Reset password & unlock",
    link,
    expiryNote:
      "This link expires in 1 hour. If this wasn't you, resetting your password now will also secure your account.",
  });

  const text = `Account temporarily locked\n\nWe noticed 5 failed login attempts on your CastWise account. For your security, it's temporarily locked.\n\nReset your password to regain access: ${link}\n\nThis link expires in 1 hour.`;

  return { subject: "Account temporarily locked", html, text };
}
