/**
 * Feedback API endpoint
 * Handles feedback and bug report submissions
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { sendBetaFeedbackEmail } from '../../utils/email.js';

// Detailed feedback submission schema (for bug reports, etc.)
const detailedFeedbackSchema = z.object({
  category: z.enum(['bug', 'feature', 'general']),
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  steps: z.string().max(2000).optional(),
  expected: z.string().max(1000).optional(),
  actual: z.string().max(1000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  consent: z.boolean(),
});

// Beta feedback submission schema (from BetaFeedback component)
const betaFeedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  type: z.enum(['bug', 'feature', 'improvement', 'general']),
  message: z.string().min(1).max(2000),
  timestamp: z.string().optional(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
});

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Try to validate as beta feedback first, then as detailed feedback
    let feedback: any;
    let feedbackType: 'beta' | 'detailed';

    const betaValidation = betaFeedbackSchema.safeParse(body);
    if (betaValidation.success) {
      feedback = betaValidation.data;
      feedbackType = 'beta';
    } else {
      const detailedValidation = detailedFeedbackSchema.safeParse(body);
      if (detailedValidation.success) {
        feedback = detailedValidation.data;
        feedbackType = 'detailed';
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid feedback data',
            details: {
              betaErrors: betaValidation.error.errors,
              detailedErrors: detailedValidation.error.errors,
            },
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // TODO: Store feedback in database
    // const feedbackRecord = await db.insert(bugReportsTable).values({
    //   id: generateId(),
    //   user_id: user?.id || null,
    //   category: feedback.category,
    //   subject: feedback.subject,
    //   description: feedback.description,
    //   steps: feedback.steps || null,
    //   expected: feedback.expected || null,
    //   actual: feedback.actual || null,
    //   severity: feedback.severity || 'medium',
    //   consent: feedback.consent,
    //   status: 'open',
    //   created_at: new Date(),
    //   updated_at: new Date(),
    // }).returning().single();

    // TODO: Send notification to admin team
    // await sendFeedbackNotification(feedbackRecord);

    // TODO: Send confirmation email to user if they provided contact info
    // if (feedback.consent && user?.email) {
    //   await sendFeedbackConfirmation(user.email, feedbackRecord.id);
    // }

    // Log the feedback (customize based on feedback type)
    if (feedbackType === 'beta') {
      console.log('BETA Feedback received:', {
        type: feedback.type,
        name: feedback.name || 'Anonymous',
        email: feedback.email || 'Not provided',
        message: feedback.message,
        url: feedback.url,
        timestamp: feedback.timestamp || new Date().toISOString(),
      });

      // Send email notification to PrideBuilds@gmail.com
      try {
        const emailSent = await sendBetaFeedbackEmail(feedback);
        if (emailSent) {
          console.log('✅ Beta feedback email sent successfully to PrideBuilds@gmail.com');
        } else {
          console.log('⚠️ Failed to send beta feedback email, but feedback was logged');
        }
      } catch (error) {
        console.error('❌ Error sending beta feedback email:', error);
        // Continue processing even if email fails
      }

    } else {
      console.log('Detailed feedback received:', {
        category: feedback.category,
        subject: feedback.subject,
        severity: feedback.severity,
        timestamp: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Feedback submitted successfully',
        id: 'temp-id', // TODO: Return actual ID from database
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing feedback:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
