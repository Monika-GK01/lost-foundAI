import { getTransporter } from '../config/mailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email asynchronously. Never throws — logs errors instead.
 */
async function sendEmail({ to, subject, html }: EmailPayload): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    logger.debug(`Email skipped (SMTP not configured): "${subject}" → ${to}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Campus LostFoundAI" <${env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent: "${subject}" → ${to}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to send email "${subject}" → ${to}: ${msg}`);
  }
}

function wrapTemplate(title: string, body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">${title}</h2>
      <div style="color: #374151; line-height: 1.6;">${body}</div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">Campus Lost & Found AI — Automated notification</p>
    </div>
  `;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export const emailService = {
  /**
   * Notify a student that an AI match was found for their lost item.
   */
  sendMatchFound(to: string, studentName: string, itemTitle: string, matchScore: number): void {
    sendEmail({
      to,
      subject: `🔍 Potential match found for "${itemTitle}"`,
      html: wrapTemplate(
        'AI Match Found!',
        `<p>Hi ${studentName},</p>
         <p>Our AI engine found a potential match for your lost item <strong>${itemTitle}</strong> with a confidence score of <strong>${Math.round(matchScore * 100)}%</strong>.</p>
         <p>Log in to review the match and submit a claim if it looks like yours.</p>`
      ),
    });
  },

  /**
   * Notify admin that a new claim has been submitted.
   */
  sendClaimSubmitted(to: string, adminName: string, studentName: string, itemTitle: string): void {
    sendEmail({
      to,
      subject: `📋 New claim submitted for "${itemTitle}"`,
      html: wrapTemplate(
        'New Claim Submitted',
        `<p>Hi ${adminName},</p>
         <p>Student <strong>${studentName}</strong> has submitted a claim for the item <strong>${itemTitle}</strong>.</p>
         <p>Please review the claim at your earliest convenience.</p>`
      ),
    });
  },

  /**
   * Notify student that their claim was approved, with pickup details.
   */
  sendClaimApproved(to: string, studentName: string, itemTitle: string, verificationCode?: string): void {
    const pickupSection = verificationCode
      ? `<p><strong>Pickup Details:</strong></p>
         <ul style="line-height: 2;">
           <li>Office: Student Affairs Office</li>
           <li>Building: Block A</li>
           <li>Room: 105</li>
           <li>Time: Next business day, 10:00 AM - 4:00 PM</li>
           <li><strong>Verification Code: ${verificationCode}</strong></li>
         </ul>
         <p>Please bring a valid ID and quote your verification code when collecting the item.</p>`
      : '<p>Please visit the campus lost & found office with your recovery receipt to collect your item.</p>';

    sendEmail({
      to,
      subject: `✅ Claim approved for "${itemTitle}"`,
      html: wrapTemplate(
        'Claim Approved! 🎉',
        `<p>Hi ${studentName},</p>
         <p>Great news! Your claim for <strong>${itemTitle}</strong> has been <strong>approved</strong>.</p>
         ${pickupSection}`
      ),
    });
  },

  /**
   * Notify student that their claim was rejected.
   */
  sendClaimRejected(to: string, studentName: string, itemTitle: string, remarks: string): void {
    sendEmail({
      to,
      subject: `❌ Claim rejected for "${itemTitle}"`,
      html: wrapTemplate(
        'Claim Update',
        `<p>Hi ${studentName},</p>
         <p>Unfortunately, your claim for <strong>${itemTitle}</strong> has been <strong>rejected</strong>.</p>
         ${remarks ? `<p><strong>Admin remarks:</strong> ${remarks}</p>` : ''}
         <p>If you believe this is an error, please contact the campus admin.</p>`
      ),
    });
  },

  /**
   * Notify student that their item has been recovered.
   */
  sendItemRecovered(to: string, studentName: string, itemTitle: string): void {
    sendEmail({
      to,
      subject: `🎉 Item recovered: "${itemTitle}"`,
      html: wrapTemplate(
        'Item Recovered!',
        `<p>Hi ${studentName},</p>
         <p>Your item <strong>${itemTitle}</strong> has been marked as <strong>recovered</strong>.</p>
         <p>Thank you for using Campus Lost & Found AI!</p>`
      ),
    });
  },
};
