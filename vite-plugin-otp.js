import nodemailer from 'nodemailer';
import { loadEnv } from 'vite';

// In-memory store for OTPs: key = `${email}:${purpose}`
const otpStore = new Map();

function getTransporter(env) {
  const host = env.MAIL_SERVER || process.env.MAIL_SERVER || 'smtp.gmail.com';
  const port = parseInt(env.MAIL_PORT || process.env.MAIL_PORT || '587', 10);
  const user = env.MAIL_USERNAME || process.env.MAIL_USERNAME || 'aravindkumarreddy00@gmail.com';
  const pass = env.MAIL_PASSWORD || process.env.MAIL_PASSWORD || 'vkat rczk wsdr bqhi';

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // STARTTLS 587
    auth: { 
      user: user.replace(/^["']|["']$/g, '').trim(), 
      pass: pass.replace(/^["']|["']$/g, '').trim() 
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export default function otpApiPlugin() {
  let env = {};

  return {
    name: 'otp-api-plugin',
    configResolved(config) {
      env = loadEnv(config.mode, config.root, '');
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }

        // Helper to parse JSON body
        const getBody = () => new Promise((resolve) => {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              resolve(JSON.parse(body || '{}'));
            } catch (e) {
              resolve({});
            }
          });
        });

        const sendJson = (statusCode, data) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        const url = req.url.split('?')[0];

        // 1. Send OTP Endpoint
        if (url === '/api/send-otp' && req.method === 'POST') {
          try {
            const { email, purpose = 'signup' } = await getBody();
            if (!email || !email.includes('@')) {
              return sendJson(400, { success: false, error: 'Valid email address is required' });
            }

            const cleanEmail = email.trim().toLowerCase();
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

            const key = `${cleanEmail}:${purpose}`;
            otpStore.set(key, { otp, expiresAt, verified: false });

            const fromEmail = (env.MAIL_FROM || process.env.MAIL_FROM || 'aravindkumarreddy00@gmail.com').replace(/^["']|["']$/g, '').trim();

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

            const transporter = getTransporter(env);
            const info = await transporter.sendMail(mailOptions);

            console.log(`[OTP API SUCCESS] Sent OTP to ${cleanEmail} (Purpose: ${purpose}, MessageId: ${info.messageId}, Code: ${otp})`);
            return sendJson(200, { success: true, message: 'OTP sent to email address successfully' });
          } catch (err) {
            console.error('[OTP API ERROR]', err);
            return sendJson(500, { success: false, error: 'Failed to send OTP email: ' + err.message });
          }
        }

        // 2. Verify OTP Endpoint
        if (url === '/api/verify-otp' && req.method === 'POST') {
          try {
            const { email, otp, purpose = 'signup' } = await getBody();
            if (!email || !otp) {
              return sendJson(400, { success: false, error: 'Email and OTP code are required' });
            }

            const cleanEmail = email.trim().toLowerCase();
            const key = `${cleanEmail}:${purpose}`;
            const record = otpStore.get(key);

            if (!record) {
              return sendJson(400, { success: false, error: 'No OTP requested for this email. Please request a new OTP.' });
            }

            if (Date.now() > record.expiresAt) {
              otpStore.delete(key);
              return sendJson(400, { success: false, error: 'OTP code has expired. Please request a new one.' });
            }

            if (record.otp !== otp.toString().trim()) {
              return sendJson(400, { success: false, error: 'Incorrect OTP code. Please check your inbox and try again.' });
            }

            record.verified = true;
            otpStore.set(key, record);

            console.log(`[OTP API SUCCESS] Verified OTP for ${cleanEmail} (Purpose: ${purpose})`);
            return sendJson(200, { success: true, message: 'OTP verified successfully' });
          } catch (err) {
            console.error('[OTP API ERROR]', err);
            return sendJson(500, { success: false, error: 'Failed to verify OTP: ' + err.message });
          }
        }

        // 3. Reset Password Endpoint
        if (url === '/api/reset-password' && req.method === 'POST') {
          try {
            const { email, otp, newPassword } = await getBody();
            if (!email || !otp || !newPassword) {
              return sendJson(400, { success: false, error: 'Email, OTP, and new password are required' });
            }

            const cleanEmail = email.trim().toLowerCase();
            const key = `${cleanEmail}:forgot_password`;
            const record = otpStore.get(key);

            if (!record || record.otp !== otp.toString().trim() || Date.now() > record.expiresAt) {
              return sendJson(400, { success: false, error: 'Invalid or expired OTP verification.' });
            }

            // Remove OTP record after successful reset
            otpStore.delete(key);

            console.log(`[OTP API SUCCESS] Password reset completed for ${cleanEmail}`);
            return sendJson(200, { success: true, message: 'Password has been reset successfully' });
          } catch (err) {
            console.error('[OTP API ERROR]', err);
            return sendJson(500, { success: false, error: 'Failed to reset password: ' + err.message });
          }
        }

        next();
      });
    }
  };
}
