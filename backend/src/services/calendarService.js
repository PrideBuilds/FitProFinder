import { google } from 'googleapis';
import db from '../database/connection.js';
import logger from '../utils/logger.js';

class CalendarService {
  constructor() {
    // Initialize OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/calendar/oauth/callback'
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Generate OAuth URL for trainer to connect Google Calendar
  generateAuthUrl(trainerId) {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: trainerId, // Pass trainer ID in state parameter
      prompt: 'consent' // Force consent screen to get refresh token
    });
  }

  // Exchange authorization code for tokens
  async handleOAuthCallback(code, trainerId) {
    try {
      const { tokens } = await this.oauth2Client.getAccessToken(code);
      
      // Set credentials for this session
      this.oauth2Client.setCredentials(tokens);

      // Get calendar list to let trainer choose
      const calendarList = await this.calendar.calendarList.list();
      const calendars = calendarList.data.items || [];

      // Store tokens in database (should be encrypted in production)
      await this.storeCalendarIntegration(trainerId, tokens, calendars[0]); // Use primary calendar by default

      return {
        success: true,
        calendars,
        integration: tokens
      };

    } catch (error) {
      logger.error('Error handling OAuth callback:', error);
      throw new Error('Failed to connect Google Calendar');
    }
  }

  // Store calendar integration in database
  async storeCalendarIntegration(trainerId, tokens, calendar) {
    const integration = {
      trainer_id: trainerId,
      provider: 'google',
      calendar_id: calendar.id,
      calendar_name: calendar.summary,
      access_token: tokens.access_token, // Should be encrypted
      refresh_token: tokens.refresh_token, // Should be encrypted
      token_expires_at: new Date(tokens.expiry_date).toISOString(),
      scope: tokens.scope,
      auto_sync_enabled: true,
      create_events_in_external: true,
      import_events_from_external: false,
      is_active: true,
      connected_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if integration already exists
    const existing = await db('calendar_integrations')
      .where({ trainer_id: trainerId, provider: 'google' })
      .first();

    if (existing) {
      await db('calendar_integrations')
        .where({ id: existing.id })
        .update({
          ...integration,
          id: undefined, // Don't update ID
          created_at: existing.created_at // Keep original created_at
        });
    } else {
      await db('calendar_integrations').insert(integration);
    }

    return integration;
  }

  // Create calendar event for booking
  async createBookingEvent(bookingId) {
    try {
      // Get booking details
      const booking = await db('bookings as b')
        .leftJoin('users as c', 'b.client_id', 'c.id')
        .leftJoin('users as t', 'b.trainer_id', 't.id')
        .leftJoin('trainer_profiles as tp', 'b.trainer_id', 'tp.user_id')
        .leftJoin('session_types as st', 'b.session_type_id', 'st.id')
        .where('b.id', bookingId)
        .select(
          'b.*',
          'c.first_name as client_first_name',
          'c.last_name as client_last_name',
          'c.email as client_email',
          't.first_name as trainer_first_name',
          't.last_name as trainer_last_name',
          'tp.business_name',
          'st.name as session_type_name',
          'st.description as session_type_description'
        )
        .first();

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Get trainer's calendar integration
      const integration = await db('calendar_integrations')
        .where({ trainer_id: booking.trainer_id, provider: 'google', is_active: true })
        .first();

      if (!integration || !integration.create_events_in_external) {
        logger.info(`No active Google Calendar integration for trainer ${booking.trainer_id}`);
        return null;
      }

      // Set up OAuth client with stored tokens
      await this.refreshTokenIfNeeded(integration);
      
      this.oauth2Client.setCredentials({
        access_token: integration.access_token,
        refresh_token: integration.refresh_token
      });

      // Create event
      const startTime = new Date(booking.scheduled_at);
      const endTime = new Date(startTime.getTime() + booking.duration_minutes * 60000);

      const eventTitle = this.formatEventTitle(integration.event_title_template, booking);
      const eventDescription = this.formatEventDescription(integration.event_description_template, booking);

      const event = {
        summary: eventTitle,
        description: eventDescription,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/Los_Angeles' // Should be configurable
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/Los_Angeles'
        },
        attendees: integration.include_client_contact ? [
          { email: booking.client_email }
        ] : [],
        visibility: integration.event_visibility || 'private',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      };

      // Add location for in-person sessions
      if (booking.session_format === 'in_person' && booking.location_details) {
        event.location = booking.location_details;
      }

      // Add video conference for online sessions
      if (booking.session_format === 'online') {
        event.conferenceData = {
          createRequest: {
            requestId: `booking-${bookingId}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        };
      }

      const createdEvent = await this.calendar.events.insert({
        calendarId: integration.calendar_id,
        resource: event,
        conferenceDataVersion: booking.session_format === 'online' ? 1 : 0
      });

      // Update booking with Google Calendar event ID
      await db('bookings')
        .where('id', bookingId)
        .update({
          meeting_link: booking.session_format === 'online' && createdEvent.data.hangoutLink 
            ? createdEvent.data.hangoutLink 
            : booking.meeting_link
        });

      // Update availability slot with sync info
      await db('availability_slots')
        .where({ trainer_id: booking.trainer_id })
        .update({
          google_calendar_event_id: createdEvent.data.id,
          last_synced_at: new Date().toISOString()
        });

      logger.info(`Created Google Calendar event ${createdEvent.data.id} for booking ${bookingId}`);
      
      return createdEvent.data;

    } catch (error) {
      logger.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Update calendar event when booking changes
  async updateBookingEvent(bookingId, changes) {
    try {
      const booking = await db('bookings').where('id', bookingId).first();
      if (!booking) return null;

      const integration = await db('calendar_integrations')
        .where({ trainer_id: booking.trainer_id, provider: 'google', is_active: true })
        .first();

      if (!integration) return null;

      // Find the calendar event (this is simplified - in practice you'd store the event ID)
      // For now, we'll just log the update
      logger.info(`Would update Google Calendar event for booking ${bookingId}`, changes);
      
      return true;
    } catch (error) {
      logger.error('Error updating calendar event:', error);
      throw error;
    }
  }

  // Delete calendar event when booking is cancelled
  async deleteBookingEvent(bookingId) {
    try {
      const booking = await db('bookings').where('id', bookingId).first();
      if (!booking) return null;

      const integration = await db('calendar_integrations')
        .where({ trainer_id: booking.trainer_id, provider: 'google', is_active: true })
        .first();

      if (!integration) return null;

      // Find and delete the calendar event
      logger.info(`Would delete Google Calendar event for booking ${bookingId}`);
      
      return true;
    } catch (error) {
      logger.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Refresh access token if needed
  async refreshTokenIfNeeded(integration) {
    const expiresAt = new Date(integration.token_expires_at);
    const now = new Date();
    
    // Refresh if token expires in less than 5 minutes
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      try {
        this.oauth2Client.setCredentials({
          refresh_token: integration.refresh_token
        });

        const { credentials } = await this.oauth2Client.refreshAccessToken();
        
        // Update stored tokens
        await db('calendar_integrations')
          .where('id', integration.id)
          .update({
            access_token: credentials.access_token,
            token_expires_at: new Date(credentials.expiry_date).toISOString(),
            updated_at: new Date().toISOString()
          });

        // Update local object
        integration.access_token = credentials.access_token;
        integration.token_expires_at = new Date(credentials.expiry_date).toISOString();

      } catch (error) {
        logger.error('Error refreshing Google Calendar token:', error);
        
        // Mark integration as inactive if refresh fails
        await db('calendar_integrations')
          .where('id', integration.id)
          .update({
            is_active: false,
            last_sync_error: error.message,
            updated_at: new Date().toISOString()
          });
        
        throw new Error('Google Calendar integration needs to be reconnected');
      }
    }
  }

  // Format event title using template
  formatEventTitle(template, booking) {
    if (!template) {
      return `FitProFinder Session - ${booking.client_first_name} ${booking.client_last_name}`;
    }

    return template
      .replace('{client_name}', `${booking.client_first_name} ${booking.client_last_name}`)
      .replace('{session_type}', booking.session_type_name)
      .replace('{business_name}', booking.business_name)
      .replace('{trainer_name}', `${booking.trainer_first_name} ${booking.trainer_last_name}`);
  }

  // Format event description using template
  formatEventDescription(template, booking) {
    if (!template) {
      return `Training session with ${booking.client_first_name} ${booking.client_last_name}\n\nSession Type: ${booking.session_type_name}\nDuration: ${booking.duration_minutes} minutes\nFormat: ${booking.session_format}\n\nClient Notes: ${booking.client_notes || 'None'}`;
    }

    return template
      .replace('{client_name}', `${booking.client_first_name} ${booking.client_last_name}`)
      .replace('{session_type}', booking.session_type_name)
      .replace('{duration}', booking.duration_minutes)
      .replace('{format}', booking.session_format)
      .replace('{client_notes}', booking.client_notes || 'None')
      .replace('{business_name}', booking.business_name);
  }

  // Sync trainer's calendar (import external events)
  async syncTrainerCalendar(trainerId) {
    try {
      const integration = await db('calendar_integrations')
        .where({ trainer_id: trainerId, provider: 'google', is_active: true })
        .first();

      if (!integration || !integration.import_events_from_external) {
        return { success: false, message: 'Calendar sync not enabled' };
      }

      await this.refreshTokenIfNeeded(integration);
      
      this.oauth2Client.setCredentials({
        access_token: integration.access_token,
        refresh_token: integration.refresh_token
      });

      // Get events from the last sync time
      const timeMin = integration.last_sync_at || new Date().toISOString();
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ahead

      const events = await this.calendar.events.list({
        calendarId: integration.calendar_id,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      });

      // Process events and create blocked time slots
      const externalEvents = events.data.items || [];
      let blockedSlots = 0;

      for (const event of externalEvents) {
        if (event.start && event.start.dateTime) {
          // Create blocked availability slot for this external event
          const startTime = new Date(event.start.dateTime);
          const endTime = new Date(event.end.dateTime);
          const dayOfWeek = startTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

          // Check if we already have a blocked slot for this event
          const existingSlot = await db('availability_slots')
            .where({
              trainer_id: trainerId,
              google_calendar_event_id: event.id
            })
            .first();

          if (!existingSlot) {
            await db('availability_slots').insert({
              trainer_id: trainerId,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              day_of_week: dayOfWeek,
              slot_type: 'blocked',
              is_recurring: false,
              max_bookings: 0,
              is_active: true,
              google_calendar_event_id: event.id,
              notes: `Blocked by external calendar event: ${event.summary}`,
              last_synced_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
            blockedSlots++;
          }
        }
      }

      // Update last sync time
      await db('calendar_integrations')
        .where('id', integration.id)
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: 'success',
          last_sync_error: null,
          updated_at: new Date().toISOString()
        });

      logger.info(`Synced ${externalEvents.length} events, created ${blockedSlots} blocked slots for trainer ${trainerId}`);

      return {
        success: true,
        eventsProcessed: externalEvents.length,
        slotsBlocked: blockedSlots
      };

    } catch (error) {
      logger.error('Error syncing calendar:', error);
      
      // Update sync status
      await db('calendar_integrations')
        .where({ trainer_id: trainerId, provider: 'google' })
        .update({
          last_sync_status: 'error',
          last_sync_error: error.message,
          updated_at: new Date().toISOString()
        });

      throw error;
    }
  }

  // Disconnect calendar integration
  async disconnectCalendar(trainerId) {
    try {
      await db('calendar_integrations')
        .where({ trainer_id: trainerId, provider: 'google' })
        .update({
          is_active: false,
          disconnected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      return { success: true };
    } catch (error) {
      logger.error('Error disconnecting calendar:', error);
      throw error;
    }
  }
}

export default new CalendarService(); 