const nodemailer = require('nodemailer');

// Configure Nodemailer Transporter
const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS.replace(/\s+/g, '') // Strip spaces from app password
      }
    });
  }

  // Fallback to test JSON transport for development
  return nodemailer.createTransport({
    jsonTransport: true
  });
};

const sendAdminApprovalEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    const loginUrl = process.env.CLIENT_URL || 'http://localhost:5173/login';

    const mailOptions = {
      from: '"Helpdesk Support" <mycoding2025@gmail.com>',
      to: userEmail,
      subject: '🎉 Congratulations! Your Admin Account Has Been Approved',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #047857; margin-bottom: 5px; font-weight: 800;">Helpdesk Support System</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Admin Access Granted</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1.5px solid #cbd5e1; border-left: 5px solid #047857;">
            <h2 style="color: #047857; margin-top: 0; font-size: 18px;">Hello ${userName},</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Great news! Your request for <strong>Admin Access</strong> on Helpdesk has been reviewed and <strong style="color: #047857;">APPROVED</strong> by the Superadmin.
            </p>
            <p style="font-size: 14px; color: #64748b;">
              You now have full access to manage support tickets, update status workflows, inspect Groq AI audit logs, and view administrative analytics.
            </p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${loginUrl}" style="background-color: #047857; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);">
                Log In With Your Credentials ➔
              </a>
            </div>
          </div>

          <div style="margin-top: 25px; text-align: center; color: #94a3b8; font-size: 12px;">
            Helpdesk Support System &bull; mycoding2025@gmail.com
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Admin approval notification sent to ${userEmail}`);
    return { success: true, info };
  } catch (error) {
    console.error('[EmailService] Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
};

const sendAdminDisapprovalEmail = async (userEmail, userName, reason) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: '"Helpdesk Support" <mycoding2025@gmail.com>',
      to: userEmail,
      subject: '⚠️ Admin Role Request Update - Helpdesk',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #dc2626; margin-bottom: 5px; font-weight: 800;">Helpdesk Support System</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Admin Access Request Status</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1.5px solid #cbd5e1; border-left: 5px solid #dc2626;">
            <h2 style="color: #dc2626; margin-top: 0; font-size: 18px;">Hello ${userName},</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Your request for <strong>Admin Access</strong> on Helpdesk was reviewed by the Superadmin and has been <strong style="color: #dc2626;">DISAPPROVED</strong>.
            </p>
            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin: 15px 0;">
              <strong style="color: #991b1b; font-size: 13px; text-transform: uppercase; display: block; margin-bottom: 4px;">Reason for Disapproval:</strong>
              <span style="color: #7f1d1d; font-size: 14px; font-style: italic;">"${reason || 'Admin account criteria not met.'}"</span>
            </div>
            <p style="font-size: 14px; color: #64748b;">
              Your account has been set to <strong>Customer Role</strong>, allowing you to create and manage support tickets freely.
            </p>
          </div>

          <div style="margin-top: 25px; text-align: center; color: #94a3b8; font-size: 12px;">
            Helpdesk Automated System &bull; mycoding2025@gmail.com
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Admin disapproval notification sent to ${userEmail}`);
    return { success: true, info };
  } catch (error) {
    console.error('[EmailService] Failed to send disapproval email:', error.message);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: '"Helpdesk Security" <mycoding2025@gmail.com>',
      to: userEmail,
      subject: '🔐 Password Reset Request - Helpdesk',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #047857; margin-bottom: 5px; font-weight: 800;">Helpdesk Support System</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Account Password Recovery Request</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1.5px solid #cbd5e1; border-left: 5px solid #047857;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Hello ${userName},</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              We received a request to reset the password for your Helpdesk account associated with <strong>${userEmail}</strong>.
            </p>
            <p style="font-size: 14px; color: #64748b;">
              Click the secure button below to set a new password. This link will expire in <strong>1 hour</strong>.
            </p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" style="background-color: #047857; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: 800; border-radius: 10px; display: inline-block; font-size: 15px; box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);">
                Reset My Password ➔
              </a>
            </div>
            <p style="font-size: 12px; color: #94a3b8; word-break: break-all; margin-top: 15px;">
              If the button above does not work, copy and paste this URL into your browser:<br/>
              <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
            </p>
          </div>

          <div style="margin-top: 25px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.4;">
            If you did not request a password reset, please ignore this email.<br/>
            Helpdesk Automated Security &bull; mycoding2025@gmail.com
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Password reset email sent to ${userEmail}`);
    return { success: true, info };
  } catch (error) {
    console.error('[EmailService] Failed to send reset email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAdminApprovalEmail,
  sendAdminDisapprovalEmail,
  sendPasswordResetEmail
};
