import { sendEmail } from "@/lib/email/sendgrid";

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://thekingside.com"}/verify-email?token=${token}`;
  return sendEmail({
    to,
    subject: "Verify your email for The King Side",
    text: `Verify your email to finish setup.\n\n${url}\n\nIf you did not request this, ignore this email.`,
    html: `<p>Verify your email to finish setup.</p><p><a href="${url}">Verify email</a></p><p>If you did not request this, ignore this email.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://thekingside.com"}/reset-password/confirm?token=${token}`;
  return sendEmail({
    to,
    subject: "Reset your password for The King Side",
    text: `Reset your password using the link below.\n\n${url}\n\nIf you did not request this, ignore this email.`,
    html: `<p>Reset your password using the link below.</p><p><a href="${url}">Reset password</a></p><p>If you did not request this, ignore this email.</p>`,
  });
}
