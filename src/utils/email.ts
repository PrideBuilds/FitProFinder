/**
 * Email utility for sending feedback notifications
 */

import nodemailer from 'nodemailer';

interface BetaFeedback {
  name?: string;
  email?: string;
  type: string;
  message: string;
  url?: string;
  timestamp?: string;
  userAgent?: string;
}

// Configure email transporter
// For production, you'll need to set these environment variables:
// - EMAIL_HOST (e.g., smtp.gmail.com)
// - EMAIL_PORT (e.g., 587)
// - EMAIL_USER (sending email address)
// - EMAIL_PASS (app password for Gmail)
function createTransporter() {
  // For development, use a simple SMTP service like Gmail
  // You'll need to enable "App Passwords" in your Gmail account
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: import.meta.env.EMAIL_USER || process.env.EMAIL_USER,
      pass: import.meta.env.EMAIL_PASS || process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

export async function sendBetaFeedbackEmail(feedback: BetaFeedback): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Verify connection
    await transporter.verify();

    const mailOptions = {
      from: import.meta.env.EMAIL_USER || process.env.EMAIL_USER,
      to: 'PrideBuilds@gmail.com',
      subject: `FitProFinder Beta Feedback - ${feedback.type}`,
      html: `
        <h2>New Beta Feedback Received</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Feedback Type:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${feedback.type}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Name:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${feedback.name || 'Anonymous'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Email:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${feedback.email || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Page URL:</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><a href="${feedback.url}">${feedback.url}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Timestamp:</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${feedback.timestamp}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold; vertical-align: top;">Message:</td>
            <td style="padding: 8px; border: 1px solid #ddd; white-space: pre-wrap;">${feedback.message}</td>
          </tr>
        </table>

        <br>
        <p style="font-size: 12px; color: #666;">
          This email was automatically generated from the FitProFinder beta feedback system.
        </p>
      `,
      text: `
        New Beta Feedback Received

        Feedback Type: ${feedback.type}
        Name: ${feedback.name || 'Anonymous'}
        Email: ${feedback.email || 'Not provided'}
        Page URL: ${feedback.url}
        Timestamp: ${feedback.timestamp}

        Message:
        ${feedback.message}
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Beta feedback email sent successfully:', result.messageId);
    return true;

  } catch (error) {
    console.error('Error sending beta feedback email:', error);
    return false;
  }
}