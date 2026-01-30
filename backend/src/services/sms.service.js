import twilio from "twilio";

function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_SMS_FROM
  );
}

export function normalizePhone(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (s.startsWith("+")) return s;

  const digits = s.replace(/\D/g, "");
  if (!digits) return "";

  // Common India formats
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;

  // Fallback: return original (may fail if not E.164)
  return s;
}

export async function sendSms(to, body) {
  if (!to) return { skipped: true };

  // Optional: works only if Twilio SMS is configured  +\change this
  if (!isSmsConfigured()) {
    console.log("[SMS disabled] Would send to:", to, "body:", body);
    return { skipped: true };
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const msg = await client.messages.create({
    from: process.env.TWILIO_SMS_FROM,
    to,
    body,
  });

  return { sid: msg.sid };
}
