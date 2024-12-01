import { NextResponse } from 'next/server';

const OVERSEERR_API_KEY = process.env.OVERSEERR_API_KEY;
const OVERSEERR_URL = process.env.OVERSEERR_URL;

if (!OVERSEERR_API_KEY || !OVERSEERR_URL) {
  throw new Error('Missing Overseerr configuration in environment variables');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    console.log('Cancelling request:', requestId);

    const response = await fetch(`${OVERSEERR_URL}/api/v1/request/${requestId}`, {
      method: 'DELETE',
      headers: {
        'X-Api-Key': OVERSEERR_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error cancelling request:', errorText);
      return NextResponse.json(
        { error: 'Failed to cancel request' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in cancel request handler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
