import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yvzoyodkolevobhdgexe.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_e3F_pBjBDFLUS1Hm9tn8bA_20AK26sZ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const memoryOtpStore = global._otpStore || new Map();
global._otpStore = memoryOtpStore;

function getTransporter() {
  const host = process.env.MAIL_SERVER || 'smtp.gmail.com';
  const port = parseInt(process.env.MAIL_PORT || '587', 10);
  const user = process.env.MAIL_USERNAME || 'aravindkumarreddy00@gmail.com';
  const pass = process.env.MAIL_PASSWORD || 'vkat rczk wsdr bqhi';

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { 
      user: user.replace(/^["']|["']$/g, '').trim(), 
      pass: pass.replace(/^["']|["']$/g, '').trim() 
    },
    tls: { rejectUnauthorized: false }
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { email, purpose = 'signup' } = req.body || {};
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const key = `${cleanEmail}:${purpose}`;
    memoryOtpStore.set(key, { otp, expiresAt, verified: false });

    try {
      await supabase.from('otp_verifications').upsert({
        email: cleanEmail,
        purpose,
        otp,
        expires_at: new Date(expiresAt).toISOString(),
        verified: false
      }, { onConflict: 'email,purpose' });
    } catch (e) {}

    const fromEmail = (process.env.MAIL_FROM || 'aravindkumarreddy00@gmail.com').replace(/^["']|["']$/g, '').trim();

    const mailOptions = {
      from: `"Lendkart Support" <${fromEmail}>`,
      to: cleanEmail,
      subject: purpose === 'signup' ? 'Lendkart - Account Verification OTP' : 'Lendkart - Password Reset OTP',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #059669; font-size: 24px; font-weight: 700; margin: 0;">Lendkart</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Share more, buy less</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 12px; text-align: center;">
            ${purpose === 'signup' ? 'Verify Your Email Address' : 'Password Reset Request'}
          </h2>
          
          <p style="font-size: 15px; color: #334155; line-height: 1.6; text-align: center; margin-bottom: 24px;">
            ${purpose === 'signup' 
              ? 'Thank you for signing up with Lendkart! Please use the OTP below to complete your registration:' 
              : 'We received a request to reset your Lendkart password. Use the OTP code below to continue:'}
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #059669; background: #ecfdf5; padding: 14px 28px; border-radius: 12px; border: 2px dashed #10b981; display: inline-block;">
              ${otp}
            </span>
          </div>
          
          <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 24px;">
            This code is valid for <strong>10 minutes</strong>. Please do not share this OTP with anyone.
          </p>
          
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            If you did not request this email, please ignore it or contact support.
          </p>
        </div>
      `
    };

    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);

    console.log(`[Vercel Serverless OTP] Sent to ${cleanEmail} (${otp})`);
    return res.status(200).json({ success: true, message: 'OTP sent to email address successfully' });
  } catch (err) {
    console.error('[Vercel Serverless OTP Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to send OTP email: ' + err.message });
  }
}
