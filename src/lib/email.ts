import { supabase } from "@/integrations/supabase/client";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export const sendEmail = async (params: SendEmailParams) => {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: params,
  });
  if (error) {
    console.error("Email send error:", error);
  }
  return data;
};

// Shared styles
const baseWrapper = `font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e8edf3;`;
const headerStyle = `background: linear-gradient(135deg, #0a1628 0%, #132347 50%, #1a3a7a 100%); padding: 48px 32px; text-align: center;`;
const logoStyle = `width: 140px; margin-bottom: 16px;`;
const h1Style = `color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.3px;`;
const bodyStyle = `padding: 36px 32px;`;
const greetStyle = `color: #0a1628; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;`;
const textStyle = `color: #4a5568; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;`;
const ctaWrap = `text-align: center; margin: 28px 0;`;
const ctaStyle = `background: linear-gradient(135deg, #d4a843, #e8c468); color: #0a1628; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 0.3px; text-transform: uppercase;`;
const footerStyle = `background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e8edf3;`;
const footerText = `color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.6;`;
const infoBox = `background: #f0f4ff; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #1a3a7a;`;
const infoRow = `display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #4a5568;`;
const infoLabel = `color: #64748b; font-size: 13px;`;
const infoValue = `color: #0a1628; font-weight: 600; font-size: 14px;`;
const divider = `border: none; border-top: 1px solid #e8edf3; margin: 24px 0;`;

const SITE_URL = "https://edu.webtuto.lk";
const LOGO_URL = "https://edu.webtuto.lk/favicon.png";

const emailShell = (heading: string, content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 24px; background: #f1f5f9;">
  <div style="${baseWrapper}">
    <div style="${headerStyle}">
      <img src="${LOGO_URL}" alt="Webtuto Academy" style="${logoStyle}" />
      <h1 style="${h1Style}">${heading}</h1>
    </div>
    <div style="${bodyStyle}">
      ${content}
    </div>
    <div style="${footerStyle}">
      <p style="${footerText}">© ${new Date().getFullYear()} Webtuto Academy. All rights reserved.</p>
      <p style="${footerText}">You're receiving this because you're registered on <a href="${SITE_URL}" style="color: #1a3a7a; text-decoration: none;">webtutoacademy.lovable.app</a></p>
    </div>
  </div>
</body>
</html>`;

export const emailTemplates = {
  // ─── Welcome / New Signup ─────────────────────────────
  welcome: (name: string, admissionNumber?: string) => ({
    subject: `Welcome to Webtuto Academy, ${name}! 🎓`,
    html: emailShell("Welcome Aboard! 🎉", `
      <p style="${greetStyle}">Hi ${name},</p>
      <p style="${textStyle}">Welcome to <strong>Webtuto Academy</strong> — Sri Lanka's premier online learning platform. Your account has been created successfully.</p>
      ${admissionNumber ? `
      <div style="${infoBox}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="${infoLabel}">Your Admission Number</td></tr>
          <tr><td style="${infoValue}; font-size: 20px; padding-top: 4px;">${admissionNumber}</td></tr>
        </table>
      </div>` : ''}
      <p style="${textStyle}">Here's what you can do next:</p>
      <ul style="${textStyle}; padding-left: 20px;">
        <li>Browse our live classes and recordings</li>
        <li>Enroll in your first class</li>
        <li>Complete your profile</li>
      </ul>
      <div style="${ctaWrap}">
        <a href="${SITE_URL}/dashboard" style="${ctaStyle}">Go to Dashboard</a>
      </div>
    `),
  }),

  // ─── Email Verification ───────────────────────────────
  emailVerification: (name: string, verifyUrl: string) => ({
    subject: `Verify your email — Webtuto Academy`,
    html: emailShell("Verify Your Email ✉️", `
      <p style="${greetStyle}">Hi ${name},</p>
      <p style="${textStyle}">Thanks for signing up! Please verify your email address to activate your account and access all features.</p>
      <div style="${ctaWrap}">
        <a href="${verifyUrl}" style="${ctaStyle}">Verify Email Address</a>
      </div>
      <p style="${textStyle}; font-size: 13px; color: #94a3b8;">If the button doesn't work, copy and paste this link: <br/><a href="${verifyUrl}" style="color: #1a3a7a; word-break: break-all;">${verifyUrl}</a></p>
    `),
  }),

  // ─── Enrollment Confirmation ──────────────────────────
  enrollmentConfirmation: (name: string, className: string, expiresAt: string) => ({
    subject: `You're enrolled in ${className}! 🎓`,
    html: emailShell("Enrollment Confirmed ✓", `
      <p style="${greetStyle}">Hi ${name},</p>
      <p style="${textStyle}">Great news! You've been successfully enrolled in <strong>${className}</strong>.</p>
      <div style="${infoBox}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="${infoLabel}">Class</td><td style="${infoValue}" align="right">${className}</td></tr>
          <tr><td colspan="2" style="padding: 6px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Access Until</td><td style="${infoValue}" align="right">${expiresAt}</td></tr>
        </table>
      </div>
      <p style="${textStyle}">Head to your dashboard to view the class schedule, join live sessions, and access resources.</p>
      <div style="${ctaWrap}">
        <a href="${SITE_URL}/dashboard/classes" style="${ctaStyle}">View My Classes</a>
      </div>
    `),
  }),

  // ─── Payment Confirmation ─────────────────────────────
  paymentConfirmation: (name: string, amount: string, className: string, transactionRef: string, paymentMethod: string) => ({
    subject: `Payment Confirmed — LKR ${amount}`,
    html: emailShell("Payment Successful 💳", `
      <p style="${greetStyle}">Hi ${name},</p>
      <p style="${textStyle}">Your payment has been successfully processed. Here are the details:</p>
      <div style="${infoBox}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="${infoLabel}">Item</td><td style="${infoValue}" align="right">${className}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Amount</td><td style="${infoValue}; color: #16a34a;" align="right">LKR ${amount}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Transaction Ref</td><td style="${infoValue}" align="right">${transactionRef}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Method</td><td style="${infoValue}" align="right">${paymentMethod}</td></tr>
        </table>
      </div>
      <div style="${ctaWrap}">
        <a href="${SITE_URL}/dashboard/payments" style="${ctaStyle}">View Payment History</a>
      </div>
      <p style="${textStyle}; font-size: 13px; color: #94a3b8;">Keep this email as your receipt. If you have questions, contact support.</p>
    `),
  }),

  // ─── Class Reminder ───────────────────────────────────
  classReminder: (name: string, className: string, dateTime: string, zoomLink?: string) => ({
    subject: `Reminder: ${className} starts soon ⏰`,
    html: emailShell("Class Starting Soon ⏰", `
      <p style="${greetStyle}">Hi ${name},</p>
      <p style="${textStyle}">Your class <strong>${className}</strong> is starting soon!</p>
      <div style="${infoBox}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="${infoLabel}">Class</td><td style="${infoValue}" align="right">${className}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Date & Time</td><td style="${infoValue}" align="right">${dateTime}</td></tr>
        </table>
      </div>
      ${zoomLink ? `
      <div style="${ctaWrap}">
        <a href="${zoomLink}" style="${ctaStyle}">Join Live Class</a>
      </div>` : `
      <div style="${ctaWrap}">
        <a href="${SITE_URL}/dashboard/schedule" style="${ctaStyle}">View Schedule</a>
      </div>`}
      <p style="${textStyle}; font-size: 13px; color: #94a3b8;">Make sure you have a stable internet connection and your notes ready!</p>
    `),
  }),

  // ─── Tutor Application Received ───────────────────────
  tutorApplicationReceived: (name: string) => ({
    subject: `Application Received — Webtuto Academy`,
    html: emailShell("Application Received 📋", `
      <p style="${greetStyle}">Hi ${name},</p>
      <p style="${textStyle}">Thank you for applying to become a tutor at <strong>Webtuto Academy</strong>! We've received your application successfully.</p>
      <div style="${infoBox}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="${infoLabel}">Status</td><td style="${infoValue}; color: #d97706;" align="right">Under Review</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Expected Response</td><td style="${infoValue}" align="right">2–5 Business Days</td></tr>
        </table>
      </div>
      <p style="${textStyle}">Our team will carefully review your qualifications and experience. We'll get back to you via email with our decision.</p>
      <p style="${textStyle}">In the meantime, feel free to explore our platform to understand our teaching methodology.</p>
      <div style="${ctaWrap}">
        <a href="${SITE_URL}/classes" style="${ctaStyle}">Explore Classes</a>
      </div>
    `),
  }),

  // ─── Tutor Application Approved ───────────────────────
  tutorApplicationApproved: (name: string) => ({
    subject: `Congratulations! You're Approved 🎉`,
    html: emailShell("Welcome to the Team! 🎉", `
      <p style="${greetStyle}">Hi ${name},</p>
      <p style="${textStyle}">Congratulations! Your tutor application has been <strong style="color: #16a34a;">approved</strong>. Welcome to the Webtuto Academy teaching team!</p>
      <p style="${textStyle}">Here's what happens next:</p>
      <ul style="${textStyle}; padding-left: 20px;">
        <li>Our admin team will set up your teacher profile</li>
        <li>You'll be assigned classes based on your expertise</li>
        <li>You'll receive access to the teacher dashboard</li>
      </ul>
      <div style="${ctaWrap}">
        <a href="${SITE_URL}/dashboard" style="${ctaStyle}">Go to Dashboard</a>
      </div>
    `),
  }),

  // ─── Tutor Application Rejected ───────────────────────
  tutorApplicationRejected: (name: string) => ({
    subject: `Application Update — Webtuto Academy`,
    html: emailShell("Application Update", `
      <p style="${greetStyle}">Hi ${name},</p>
      <p style="${textStyle}">Thank you for your interest in teaching at Webtuto Academy. After careful review, we're unable to accept your application at this time.</p>
      <p style="${textStyle}">This doesn't mean the door is closed! We encourage you to:</p>
      <ul style="${textStyle}; padding-left: 20px;">
        <li>Gain more teaching experience</li>
        <li>Re-apply after 3 months</li>
        <li>Reach out to us for specific feedback</li>
      </ul>
      <p style="${textStyle}">We wish you all the best in your teaching journey.</p>
    `),
  }),

  // ─── Certificate Issued ───────────────────────────────
  certificateIssued: (name: string, className: string, certNumber: string) => ({
    subject: `Your Certificate is Ready! 🏆`,
    html: emailShell("Certificate Issued 🏆", `
      <p style="${greetStyle}">Hi ${name},</p>
      <p style="${textStyle}">Congratulations on completing <strong>${className}</strong>! Your certificate has been issued.</p>
      <div style="${infoBox}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="${infoLabel}">Class</td><td style="${infoValue}" align="right">${className}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Certificate Number</td><td style="${infoValue}" align="right">${certNumber}</td></tr>
        </table>
      </div>
      <div style="${ctaWrap}">
        <a href="${SITE_URL}/dashboard/certificates" style="${ctaStyle}">View Certificate</a>
      </div>
    `),
  }),

  // ─── Password Reset ───────────────────────────────────
  passwordReset: (name: string, resetUrl: string) => ({
    subject: `Reset Your Password — Webtuto Academy`,
    html: emailShell("Reset Your Password 🔒", `
      <p style="${greetStyle}">Hi ${name},</p>
      <p style="${textStyle}">We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="${ctaWrap}">
        <a href="${resetUrl}" style="${ctaStyle}">Reset Password</a>
      </div>
      <p style="${textStyle}; font-size: 13px; color: #94a3b8;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
      <p style="${textStyle}; font-size: 13px; color: #94a3b8;">If the button doesn't work, copy this link: <br/><a href="${resetUrl}" style="color: #1a3a7a; word-break: break-all;">${resetUrl}</a></p>
    `),
  }),

  // ─── Admin: New Signup Notification ────────────────────
  adminNewSignup: (studentName: string, email: string, admissionNumber: string) => ({
    subject: `New Student Signup: ${studentName}`,
    html: emailShell("New Student Registration 👤", `
      <p style="${greetStyle}">New Student Alert!</p>
      <p style="${textStyle}">A new student has registered on Webtuto Academy.</p>
      <div style="${infoBox}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="${infoLabel}">Name</td><td style="${infoValue}" align="right">${studentName}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Email</td><td style="${infoValue}" align="right">${email}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Admission No.</td><td style="${infoValue}" align="right">${admissionNumber}</td></tr>
        </table>
      </div>
      <div style="${ctaWrap}">
        <a href="${SITE_URL}/admin/students" style="${ctaStyle}">View Students</a>
      </div>
    `),
  }),

  // ─── Admin: New Payment Notification ──────────────────
  adminNewPayment: (studentName: string, amount: string, className: string, transactionRef: string) => ({
    subject: `New Payment: LKR ${amount} from ${studentName}`,
    html: emailShell("New Payment Received 💰", `
      <p style="${greetStyle}">Payment Alert!</p>
      <p style="${textStyle}">A new payment has been received on Webtuto Academy.</p>
      <div style="${infoBox}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="${infoLabel}">Student</td><td style="${infoValue}" align="right">${studentName}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Amount</td><td style="${infoValue}; color: #16a34a;" align="right">LKR ${amount}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Class</td><td style="${infoValue}" align="right">${className}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Ref</td><td style="${infoValue}" align="right">${transactionRef}</td></tr>
        </table>
      </div>
      <div style="${ctaWrap}">
        <a href="${SITE_URL}/admin/payments" style="${ctaStyle}">View Payments</a>
      </div>
    `),
  }),

  // ─── Admin: New Tutor Application ─────────────────────
  adminNewApplication: (applicantName: string, email: string, subjects: string) => ({
    subject: `New Tutor Application: ${applicantName}`,
    html: emailShell("New Tutor Application 📝", `
      <p style="${greetStyle}">New Application Alert!</p>
      <p style="${textStyle}">A new tutor application has been submitted.</p>
      <div style="${infoBox}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="${infoLabel}">Applicant</td><td style="${infoValue}" align="right">${applicantName}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Email</td><td style="${infoValue}" align="right">${email}</td></tr>
          <tr><td colspan="2" style="padding: 4px 0;"><hr style="${divider}; margin: 0;" /></td></tr>
          <tr><td style="${infoLabel}">Subjects</td><td style="${infoValue}" align="right">${subjects}</td></tr>
        </table>
      </div>
      <div style="${ctaWrap}">
        <a href="${SITE_URL}/admin/applications" style="${ctaStyle}">Review Applications</a>
      </div>
    `),
  }),
};
