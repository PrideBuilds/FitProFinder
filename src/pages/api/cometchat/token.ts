import type { APIRoute } from 'astro';

// Enable server-side rendering for this API route
export const prerender = false;

interface CometChatUser {
  uid: string;
  name: string;
  avatar?: string;
}

interface CometChatTokenResponse {
  authToken: string;
  uid: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { uid, name, avatar }: CometChatUser = await request.json();

    if (!uid || !name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'UID and name are required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // For development, we'll use a mock token generation
    // This will work without any environment variables
    const mockAuthToken = `mock_token_${uid}_${Date.now()}`;
    const appId = 'your-app-id';
    const region = 'your-region';

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authToken: mockAuthToken,
          uid: uid,
          appId: appId,
          region: region,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // Production implementation would call CometChat REST API
    // This is a placeholder for the actual implementation
    const response = await fetch(
      `https://${region}.api.cometchat.com/v2.0/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: restApiKey,
          appid: appId,
        },
        body: JSON.stringify({
          uid: uid,
          name: name,
          avatar: avatar || '',
          role: 'default',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`CometChat API error: ${response.status}`);
    }

    // Generate auth token for the user
    const tokenResponse = await fetch(
      `https://${region}.api.cometchat.com/v2.0/users/${uid}/auth_tokens`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: restApiKey,
          appid: appId,
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(`Token generation error: ${tokenResponse.status}`);
    }

    const tokenData: CometChatTokenResponse = await tokenResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authToken: tokenData.authToken,
          uid: uid,
          appId: appId,
          region: region,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('CometChat token generation error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate CometChat token',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
