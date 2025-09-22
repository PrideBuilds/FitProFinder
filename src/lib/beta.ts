/**
 * Beta access controls and invite system
 * Handles invite code validation and beta user management
 */

import { z } from 'zod';

// Invite code validation schema
export const inviteCodeSchema = z.object({
  code: z
    .string()
    .min(6)
    .max(20)
    .regex(/^[A-Z0-9]+$/),
  email: z.string().email(),
});

export type InviteCodeData = z.infer<typeof inviteCodeSchema>;

// Beta invite types
export interface BetaInvite {
  id: string;
  code: string;
  email: string;
  redeemed_at: Date | null;
  created_by: string;
  created_at: Date;
  expires_at: Date | null;
}

export interface BetaUser {
  id: string;
  user_id: string;
  invite_code: string;
  redeemed_at: Date;
  created_at: Date;
}

/**
 * Validate invite code format
 */
export function validateInviteCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{6,20}$/.test(code);
}

/**
 * Generate a random invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if an invite code is valid and not expired
 * TODO: Replace with actual database query
 */
export async function validateInviteCode(code: string): Promise<{
  valid: boolean;
  invite?: BetaInvite;
  error?: string;
}> {
  try {
    // TODO: Query database for invite code
    // const invite = await db.select().from(betaInvitesTable)
    //   .where(eq(betaInvitesTable.code, code))
    //   .where(isNull(betaInvitesTable.redeemed_at))
    //   .where(gt(betaInvitesTable.expires_at, new Date()))
    //   .single();

    // Mock validation for now
    const mockInvite: BetaInvite = {
      id: '1',
      code: code,
      email: 'test@example.com',
      redeemed_at: null,
      created_by: 'admin',
      created_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    if (code === 'INVALID') {
      return { valid: false, error: 'Invalid invite code' };
    }

    if (code === 'EXPIRED') {
      return { valid: false, error: 'Invite code has expired' };
    }

    if (code === 'USED') {
      return { valid: false, error: 'Invite code has already been used' };
    }

    return { valid: true, invite: mockInvite };
  } catch (error) {
    console.error('Error validating invite code:', error);
    return { valid: false, error: 'Failed to validate invite code' };
  }
}

/**
 * Redeem an invite code for a user
 * TODO: Replace with actual database operations
 */
export async function redeemInviteCode(
  code: string,
  userId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate the invite code first
    const validation = await validateInviteCode(code);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // TODO: Update database to mark invite as redeemed
    // await db.update(betaInvitesTable)
    //   .set({ redeemed_at: new Date() })
    //   .where(eq(betaInvitesTable.code, code));

    // TODO: Create beta user record
    // await db.insert(betaUsersTable).values({
    //   user_id: userId,
    //   invite_code: code,
    //   redeemed_at: new Date(),
    // });

    return { success: true };
  } catch (error) {
    console.error('Error redeeming invite code:', error);
    return { success: false, error: 'Failed to redeem invite code' };
  }
}

/**
 * Check if a user has beta access
 * TODO: Replace with actual database query
 */
export async function hasBetaAccess(userId: string): Promise<boolean> {
  try {
    // TODO: Query database for beta user record
    // const betaUser = await db.select().from(betaUsersTable)
    //   .where(eq(betaUsersTable.user_id, userId))
    //   .single();

    // Mock check for now
    return true; // Assume all users have beta access for now
  } catch (error) {
    console.error('Error checking beta access:', error);
    return false;
  }
}

/**
 * Create a new beta invite
 * TODO: Replace with actual database operations
 */
export async function createBetaInvite(
  email: string,
  createdBy: string,
  expiresInDays: number = 30
): Promise<{
  success: boolean;
  invite?: BetaInvite;
  error?: string;
}> {
  try {
    const code = generateInviteCode();
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000
    );

    // TODO: Insert into database
    // const invite = await db.insert(betaInvitesTable).values({
    //   code,
    //   email,
    //   created_by: createdBy,
    //   expires_at: expiresAt,
    // }).returning().single();

    const mockInvite: BetaInvite = {
      id: '1',
      code,
      email,
      redeemed_at: null,
      created_by: createdBy,
      created_at: new Date(),
      expires_at: expiresAt,
    };

    return { success: true, invite: mockInvite };
  } catch (error) {
    console.error('Error creating beta invite:', error);
    return { success: false, error: 'Failed to create beta invite' };
  }
}

/**
 * Get all beta invites for a user
 * TODO: Replace with actual database query
 */
export async function getBetaInvites(createdBy: string): Promise<BetaInvite[]> {
  try {
    // TODO: Query database
    // const invites = await db.select().from(betaInvitesTable)
    //   .where(eq(betaInvitesTable.created_by, createdBy))
    //   .orderBy(desc(betaInvitesTable.created_at));

    // Mock data for now
    return [];
  } catch (error) {
    console.error('Error fetching beta invites:', error);
    return [];
  }
}
