/**
 * Feedback API endpoint
 * Handles feedback and bug report submissions
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';

// Feedback submission schema
const feedbackSchema = z.object({
  category: z.enum(['bug', 'feature', 'general']),
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  steps: z.string().max(2000).optional(),
  expected: z.string().max(1000).optional(),
  actual: z.string().max(1000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  consent: z.boolean(),
});

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = feedbackSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid feedback data',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const feedback = validationResult.data;

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

    // Log the feedback for now
    console.log('Feedback received:', {
      category: feedback.category,
      subject: feedback.subject,
      severity: feedback.severity,
      timestamp: new Date().toISOString(),
    });

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
