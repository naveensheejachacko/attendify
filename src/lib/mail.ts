type SendOtpInput = {
  to: string;
  code: string;
  purpose: "verify" | "reset";
};

const RESEND_TEST_FROM = "Attendify <beth.t@example.com>";

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

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || RESEND_TEST_FROM;
  const usingUnverifiedExample = from.includes("example.com");

  if (apiKey && !usingUnverifiedExample) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, html }),
      });
      if (response.ok) {
        return { delivered: true };
      }
      const body = await response.text();
      console.error(`[attendify] Resend rejected the email: ${body}`);
    } catch (error) {
      console.error("[attendify] Resend request failed", error);
    }
  } else if (apiKey && usingUnverifiedExample) {
    console.warn(
      "[attendify] EMAIL_FROM uses example.com, which Resend will reject. Using onboarding@resend.dev instead.",
    );
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: RESEND_TEST_FROM, to, subject, html }),
      });
      if (response.ok) {
        return { delivered: true };
      }
      const body = await response.text();
      console.error(`[attendify] Resend rejected the email: ${body}`);
    } catch (error) {
      console.error("[attendify] Resend request failed", error);
    }
  }

  console.info(`[attendify] OTP for ${to} (${purpose}): ${code}`);
  return {
    delivered: false,
    previewCode: code,
  };
}
