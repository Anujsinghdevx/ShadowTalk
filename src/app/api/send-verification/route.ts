import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const rateLimitMap = new Map<string, number>();

function sanitizeInput(input: string) {
  return input.replace(/[&<>"']/g, (match) => {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return escapeMap[match];
  });
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'unknown';

    const now = Date.now();
    const lastRequest = rateLimitMap.get(ip);
    if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
      return NextResponse.json(
        { message: 'Please wait 1 minute before requesting another OTP.' },
        { status: 429 }
      );
    }
    rateLimitMap.set(ip, now);

    const { email, username, otp } = await req.json();

    if (
      !email || typeof email !== 'string' || !emailRegex.test(email.trim()) ||
      !username || typeof username !== 'string' || username.trim().length < 2 ||
      !otp || typeof otp !== 'string' || otp.trim().length !== 6
    ) {
      return NextResponse.json(
        { message: 'Invalid input. Please check your email, username, and OTP.' },
        { status: 400 }
      );
    }

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      return NextResponse.json(
        { message: 'SMTP configuration error' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const safeUsername = sanitizeInput(username.trim());
    const safeOtp = sanitizeInput(otp.trim());

    // Composing similar to @react-email styled email
    const html = `
      <div style="font-family: Roboto, Verdana, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hello ${safeUsername},</h2>
        <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
        <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">${safeOtp}</div>
        <p>If you did not request this code, please ignore this email.</p>
        <br/>
        <p style="font-size: 12px; color: #888;">Sent via your app's verification service.</p>
      </div>
    `;

    const mailOptions = {
      from: `"Verification Team" <${smtpEmail}>`,
      to: email,
      subject: '🔐 Your Verification Code',
      html,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Verification email sent successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Verification email error:', error);
    return NextResponse.json(
      { message: 'Failed to send verification email.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
