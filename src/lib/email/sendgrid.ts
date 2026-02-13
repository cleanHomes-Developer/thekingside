import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(payload: EmailPayload) {
  if (!apiKey || !fromEmail) {
    return { ok: false, error: "SendGrid is not configured." };
  }

  try {
    await sgMail.send({
      to: payload.to,
      from: fromEmail,
      subject: payload.subject,
      text: payload.text,
      html: payload.html ?? payload.text.replace(/\n/g, "<br/>"),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}
