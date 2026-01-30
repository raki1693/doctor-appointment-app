import nodemailer from "nodemailer";

export const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP env missing. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // 587 uses STARTTLS
    auth: { user, pass },
    // ✅ Windows/Proxy fix: avoids "self-signed certificate in certificate chain"
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const sendResetOtpEmail = async ({ to, otp }) => {
  const transporter = createTransporter();

  const subject = "Your password reset OTP";
  const text = `Your OTP to reset password is: ${otp}

This OTP is valid for 10 minutes.
If you did not request this, ignore this email.`;

  await transporter.sendMail({
    from: `"Gov Hospital OPD" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
};

export const sendEmergencyAmbulanceEmail = async ({
  to,
  name,
  phone,
  email,
  location,
  requestId,
}) => {
  const transporter = createTransporter();

  const subject = "🚑 EMERGENCY: Ambulance request received";
  const locText = location?.lat && location?.lng
    ? `Lat: ${location.lat}\nLng: ${location.lng}\nAccuracy: ${location.accuracy ?? ""}\nNote: ${location.note ?? ""}`
    : `Location not available. Note: ${location?.note ?? ""}`;

  const text = `An emergency ambulance request has been created.

Request ID: ${requestId}
Name: ${name || "(not provided)"}
Phone: ${phone || "(not provided)"}
Email: ${email || "(not provided)"}

Location:\n${locText}

Please dispatch an ambulance immediately and follow hospital SOP.`;

  await transporter.sendMail({
    from: `"Gov Hospital OPD" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
};
