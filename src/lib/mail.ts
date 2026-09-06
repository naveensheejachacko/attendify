type SendOtpInput = {
  to: string;
  code: string;
  purpose: "verify" | "reset";
};

export async function sendOtpEmail({
  to,
  code,
  purpose,
}: SendOtpInput): Promise<{ delivered: boolean; previewCode?: string }> {
  const subject =
    purpose === "verify"
      ? "Your Attendify verification code"
      : "Your Attendify password reset code";
  const html = `<p>Your code is <strong>${code}</strong>. It expires in 10 minutes.</p>`;

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const from = process.env.EMAIL_FROM ?? "Attendify <noreply@example.com>";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Email send failed: ${body}`);
    }
    return { delivered: true };
  }

  console.info(`[attendify] OTP for ${to} (${purpose}): ${code}`);
  return {
    delivered: false,
    previewCode: process.env.NODE_ENV === "production" ? undefined : code,
  };
}
