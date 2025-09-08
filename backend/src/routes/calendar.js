import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../database/connection.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import calendarService from '../services/calendarService.js';

const router = express.Router();

// Get trainer's calendar integration status
router.get('/integration/status', authenticate, async (req, res, next) => {
  try {
    const trainerId = req.user.id;

    // Check if user is a trainer
    const trainer = await db('trainer_profiles')
      .where('user_id', trainerId)
      .first();
    if (!trainer) {
      return next(
        new ApiError(
          'Only trainers can access calendar integration',
          'TRAINER_ONLY',
          403
        )
      );
    }

    // Get calendar integration
    const integration = await db('calendar_integrations')
      .where({ trainer_id: trainerId, provider: 'google' })
      .first();

    if (!integration) {
      return res.json({
        success: true,
        data: {
          connected: false,
          integration: null,
        },
      });
    }

    // Don't send sensitive tokens to frontend
    const safeIntegration = {
      id: integration.id,
      provider: integration.provider,
      calendar_name: integration.calendar_name,
      is_active: integration.is_active,
      auto_sync_enabled: integration.auto_sync_enabled,
      create_events_in_external: integration.create_events_in_external,
      import_events_from_external: integration.import_events_from_external,
      sync_interval_minutes: integration.sync_interval_minutes,
      last_sync_at: integration.last_sync_at,
      last_sync_status: integration.last_sync_status,
      last_sync_error: integration.last_sync_error,
      event_title_template: integration.event_title_template,
      event_visibility: integration.event_visibility,
      include_client_contact: integration.include_client_contact,
      connected_at: integration.connected_at,
    };

    res.json({
      success: true,
      data: {
        connected: true,
        integration: safeIntegration,
      },
    });
  } catch (error) {
    logger.error('Error getting calendar integration status:', error);
    next(
      new ApiError(
        'Failed to get calendar integration status',
        'INTEGRATION_STATUS_ERROR',
        500
      )
    );
  }
});

// Initiate Google Calendar OAuth flow
router.get('/connect/google', authenticate, async (req, res, next) => {
  try {
    const trainerId = req.user.id;

    // Check if user is a trainer
    const trainer = await db('trainer_profiles')
      .where('user_id', trainerId)
      .first();
    if (!trainer) {
      return next(
        new ApiError(
          'Only trainers can connect calendar integration',
          'TRAINER_ONLY',
          403
        )
      );
    }

    // Generate OAuth URL
    const authUrl = calendarService.generateAuthUrl(trainerId);

    res.json({
      success: true,
      data: {
        authUrl,
        message:
          'Redirect user to this URL to authorize Google Calendar access',
      },
    });
  } catch (error) {
    logger.error('Error generating Google Calendar auth URL:', error);
    next(
      new ApiError(
        'Failed to generate authorization URL',
        'AUTH_URL_ERROR',
        500
      )
    );
  }
});

// Handle OAuth callback
router.get('/oauth/callback', async (req, res, next) => {
  try {
    const { code, state: trainerId, error } = req.query;

    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard/trainer?calendar_error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !trainerId) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard/trainer?calendar_error=missing_parameters`
      );
    }

    // Handle the OAuth callback
    const result = await calendarService.handleOAuthCallback(code, trainerId);

    if (result.success) {
      res.redirect(
        `${process.env.FRONTEND_URL}/dashboard/trainer?calendar_connected=true`
      );
    } else {
      res.redirect(
        `${process.env.FRONTEND_URL}/dashboard/trainer?calendar_error=connection_failed`
      );
    }
  } catch (error) {
    logger.error('Error handling OAuth callback:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard/trainer?calendar_error=connection_failed`
    );
  }
});

// Update calendar integration settings
router.patch('/integration/settings', authenticate, async (req, res, next) => {
  try {
    const trainerId = req.user.id;
    const {
      auto_sync_enabled,
      create_events_in_external,
      import_events_from_external,
      sync_interval_minutes,
      event_title_template,
      event_description_template,
      event_visibility,
      include_client_contact,
    } = req.body;

    // Check if integration exists
    const integration = await db('calendar_integrations')
      .where({ trainer_id: trainerId, provider: 'google' })
      .first();

    if (!integration) {
      return next(
        new ApiError(
          'Calendar integration not found',
          'INTEGRATION_NOT_FOUND',
          404
        )
      );
    }

    // Update settings
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (auto_sync_enabled !== undefined)
      updateData.auto_sync_enabled = auto_sync_enabled;
    if (create_events_in_external !== undefined)
      updateData.create_events_in_external = create_events_in_external;
    if (import_events_from_external !== undefined)
      updateData.import_events_from_external = import_events_from_external;
    if (sync_interval_minutes !== undefined)
      updateData.sync_interval_minutes = sync_interval_minutes;
    if (event_title_template !== undefined)
      updateData.event_title_template = event_title_template;
    if (event_description_template !== undefined)
      updateData.event_description_template = event_description_template;
    if (event_visibility !== undefined)
      updateData.event_visibility = event_visibility;
    if (include_client_contact !== undefined)
      updateData.include_client_contact = include_client_contact;

    await db('calendar_integrations')
      .where('id', integration.id)
      .update(updateData);

    res.json({
      success: true,
      data: { message: 'Calendar integration settings updated successfully' },
    });
  } catch (error) {
    logger.error('Error updating calendar integration settings:', error);
    next(
      new ApiError(
        'Failed to update calendar integration settings',
        'SETTINGS_UPDATE_ERROR',
        500
      )
    );
  }
});

// Manually sync calendar
router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const trainerId = req.user.id;

    const result = await calendarService.syncTrainerCalendar(trainerId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error syncing calendar:', error);
    next(new ApiError('Failed to sync calendar', 'SYNC_ERROR', 500));
  }
});

// Disconnect calendar integration
router.delete('/integration', authenticate, async (req, res, next) => {
  try {
    const trainerId = req.user.id;

    const result = await calendarService.disconnectCalendar(trainerId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error disconnecting calendar:', error);
    next(
      new ApiError('Failed to disconnect calendar', 'DISCONNECT_ERROR', 500)
    );
  }
});

// Test calendar connection
router.post('/test', authenticate, async (req, res, next) => {
  try {
    const trainerId = req.user.id;

    // Get integration
    const integration = await db('calendar_integrations')
      .where({ trainer_id: trainerId, provider: 'google', is_active: true })
      .first();

    if (!integration) {
      return next(
        new ApiError(
          'No active calendar integration found',
          'NO_INTEGRATION',
          404
        )
      );
    }

    // Try to list calendars to test connection
    try {
      await calendarService.refreshTokenIfNeeded(integration);

      res.json({
        success: true,
        data: {
          connected: true,
          calendar_name: integration.calendar_name,
          last_sync: integration.last_sync_at,
          message: 'Calendar connection is working properly',
        },
      });
    } catch (error) {
      res.json({
        success: false,
        data: {
          connected: false,
          error: error.message,
          message: 'Calendar connection needs to be renewed',
        },
      });
    }
  } catch (error) {
    logger.error('Error testing calendar connection:', error);
    next(new ApiError('Failed to test calendar connection', 'TEST_ERROR', 500));
  }
});

export default router;
