import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, text }) {
  const { error } = await resend.emails.send({
    from: "Castwise <noreply@castwise.site>",
    to,
    subject,
    html,
    text,
  });
  if (error) {
    throw new Error(error.message);
  }
}
