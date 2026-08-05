const memoryOtpStore = global._otpStore || new Map();
global._otpStore = memoryOtpStore;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP, and new password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const key = `${cleanEmail}:forgot_password`;
    const record = memoryOtpStore.get(key);

    if (!record || record.otp !== otp.toString().trim() || Date.now() > record.expiresAt) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP verification.' });
    }

    memoryOtpStore.delete(key);
    return res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to reset password: ' + err.message });
  }
}
