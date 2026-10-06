const FEATURES = [
  "Schedule content across devices",
  "Real-time device monitoring",
  "Playlist & content library",
  "Centralized dashboard overview",
];

function baseShell({ heading, intro, ctaLabel, link, expiryNote }) {
  const featureRows = FEATURES.map(
    (f) =>
      `<tr><td style="padding:6px 0;font-size:13px;color:#c9d1d9;">• &nbsp;${f}</td></tr>`,
  ).join("");

  const html = `
<div style="background:#0d1117;padding:40px 20px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;border-collapse:collapse;">
    <tr>
      <td style="padding-bottom:28px;">
        <table role="presentation">
          <tr>
            <td style="width:36px;height:36px;background:#2f81f7;border-radius:8px;text-align:center;vertical-align:middle;">
              <span style="color:#fff;font-size:18px;line-height:36px;">&#9635;</span>
            </td>
            <td style="padding-left:10px;font-size:15px;font-weight:600;color:#e6edf3;">Device Fleet Manager</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#161b22;border:1px solid #30363d;border-radius:12px;padding:32px;">
        <h1 style="margin:0 0 10px;font-size:20px;color:#e6edf3;">${heading}</h1>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#8b949e;">${intro}</p>

        <table role="presentation" width="100%" style="margin:0 0 26px;">
          ${featureRows}
        </table>

        <table role="presentation" width="100%">
          <tr>
            <td align="center">
              <a href="${link}" style="display:inline-block;background:#2f81f7;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;">${ctaLabel}</a>
            </td>
          </tr>
        </table>

        <p style="margin:22px 0 0;font-size:12px;color:#8b949e;text-align:center;">${expiryNote}</p>
      </td>
    </tr>
    <tr>
      <td style="padding-top:20px;text-align:center;font-size:11px;color:#484f58;">&copy; 2026 Device Fleet Manager</td>
    </tr>
  </table>
</div>`;

  return html;
}

export function buildVerificationEmail(link) {
  const html = baseShell({
    heading: "Verify your email",
    intro:
      "You're almost ready to manage your digital signage fleet. Confirm your email address to activate your account and get access to:",
    ctaLabel: "Verify email address",
    link,
    expiryNote:
      "This link expires in 24 hours. If you didn't create this account, you can ignore this email.",
  });

  const text = `Verify your email\n\nYou're almost ready to manage your digital signage fleet. Confirm your email address to activate your account.\n\nWhat you get:\n${FEATURES.map((f) => `- ${f}`).join("\n")}\n\nVerify your email: ${link}\n\nThis link expires in 24 hours. If you didn't create this account, you can ignore this email.`;

  return { subject: "Verify your email", html, text };
}

export function buildResetPasswordEmail(link) {
  const html = baseShell({
    heading: "Reset your password",
    intro:
      "We received a request to reset the password on your Device Fleet Manager account. Choose a new password to get back to managing your fleet:",
    ctaLabel: "Reset password",
    link,
    expiryNote:
      "This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
  });

  const text = `Reset your password\n\nWe received a request to reset the password on your Device Fleet Manager account.\n\nReset your password: ${link}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`;

  return { subject: "Reset your password", html, text };
}
