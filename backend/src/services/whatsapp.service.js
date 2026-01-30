import twilio from "twilio";

function isConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_FROM &&
      process.env.WHATSAPP_ADMIN_TO
  );
}

export async function sendWhatsAppAdminAlert(messageText) {
  // Optional: works only if Twilio WhatsApp is configured  +\change this
  if (!isConfigured()) {
    console.log("[WhatsApp disabled] Would send:", messageText);
    return;
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: process.env.WHATSAPP_ADMIN_TO,
    body: messageText,
  });
}
