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
    throw new Error(error.message || "Failed to send email");
  }

  return data;
};

// Pre-built email templates
export const emailTemplates = {
  enrollmentConfirmation: (studentName: string, className: string) => ({
    subject: `Welcome to ${className} — Webtuto Academy`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0a1628 0%, #132347 40%, #1a3a7a 100%); padding: 40px 32px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Welcome to Webtuto Academy</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #1a1a2e; font-size: 16px;">Hi ${studentName},</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">You've successfully enrolled in <strong>${className}</strong>. We're excited to have you!</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Head to your dashboard to view the class schedule and resources.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://webtutoacademy.lovable.app/dashboard" style="background: linear-gradient(135deg, #d4a843, #e8c468); color: #0a1628; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">Go to Dashboard</a>
          </div>
          <p style="color: #888; font-size: 13px; text-align: center; margin-top: 32px;">— The Webtuto Academy Team</p>
        </div>
      </div>
    `,
  }),

  classReminder: (studentName: string, className: string, dateTime: string, zoomLink?: string) => ({
    subject: `Reminder: ${className} starts soon`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0a1628 0%, #132347 40%, #1a3a7a 100%); padding: 40px 32px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Class Reminder 📚</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #1a1a2e; font-size: 16px;">Hi ${studentName},</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Your class <strong>${className}</strong> is scheduled for <strong>${dateTime}</strong>.</p>
          ${zoomLink ? `
          <div style="text-align: center; margin: 32px 0;">
            <a href="${zoomLink}" style="background: linear-gradient(135deg, #d4a843, #e8c468); color: #0a1628; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">Join Class</a>
          </div>` : ''}
          <p style="color: #888; font-size: 13px; text-align: center; margin-top: 32px;">— The Webtuto Academy Team</p>
        </div>
      </div>
    `,
  }),

  paymentConfirmation: (studentName: string, amount: string, className: string, transactionRef: string) => ({
    subject: `Payment Confirmed — ${className}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0a1628 0%, #132347 40%, #1a3a7a 100%); padding: 40px 32px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Payment Confirmed ✓</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #1a1a2e; font-size: 16px;">Hi ${studentName},</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Your payment of <strong>${amount}</strong> for <strong>${className}</strong> has been confirmed.</p>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #555; font-size: 14px; margin: 4px 0;">Transaction Ref: <strong>${transactionRef}</strong></p>
          </div>
          <p style="color: #888; font-size: 13px; text-align: center; margin-top: 32px;">— The Webtuto Academy Team</p>
        </div>
      </div>
    `,
  }),
};
