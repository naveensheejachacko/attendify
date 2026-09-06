type SendOtpInput = {
  to: string;
  code: string;
  purpose: "verify" | "reset";
};

const RESEND_TEST_FROM = "Attendify <beth.t@example.com>";

function senderAddress(): string {
  const from = process.env.EMAIL_FROM?.trim() || RESEND_TEST_FROM;
  if (from.includes("@example.com")) {
    return RESEND_TEST_FROM;
  }
  return from;
}

function resendMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string };
    if (parsed.message) {
      return parsed.message;
    }
  } catch {
    // keep raw body
  }
  return body.slice(0, 280);
}

export async function sendOtpEmail({
  to,
  code,
  purpose,
}: SendOtpInput): Promise<{ delivered: boolean; error?: string }> {
  const subject =
    purpose === "verify"
      ? "Your Attendify verification code"
      : "Your Attendify password reset code";
  const html = `<p>Your Attendify code is <strong>${code}</strong>. It expires in 10 minutes.</p>`;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      delivered: false,
      error:
        "RESEND_API_KEY is missing. Add it to .env (and Vercel), then restart the server.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: senderAddress(),
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[attendify] Resend error ${response.status}: ${body}`);
    return { delivered: false, error: resendMessage(body) };
  }

  return { delivered: true };
}
