import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yvzoyodkolevobhdgexe.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_e3F_pBjBDFLUS1Hm9tn8bA_20AK26sZ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const memoryOtpStore = global._otpStore || new Map();
global._otpStore = memoryOtpStore;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  try {
    const { email, otp, purpose = 'signup' } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP code are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const key = `${cleanEmail}:${purpose}`;
    let record = memoryOtpStore.get(key);

    if (!record) {
      try {
        const { data } = await supabase
          .from('otp_verifications')
          .select('*')
          .eq('email', cleanEmail)
          .eq('purpose', purpose)
          .single();
        if (data) {
          record = {
            otp: data.otp,
            expiresAt: new Date(data.expires_at).getTime(),
            verified: data.verified
          };
        }
      } catch (e) {}
    }

    if (!record) {
      return res.status(400).json({ success: false, error: 'No OTP requested for this email. Please request a new OTP.' });
    }

    if (Date.now() > record.expiresAt) {
      memoryOtpStore.delete(key);
      return res.status(400).json({ success: false, error: 'OTP code has expired. Please request a new one.' });
    }

    if (record.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, error: 'Incorrect OTP code. Please check your inbox and try again.' });
    }

    record.verified = true;
    memoryOtpStore.set(key, record);

    return res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to verify OTP: ' + err.message });
  }
}
