import { NextResponse } from 'next/server';

const OVERSEERR_API_KEY = process.env.OVERSEERR_API_KEY;
const OVERSEERR_URL = process.env.OVERSEERR_URL;

if (!OVERSEERR_API_KEY || !OVERSEERR_URL) {
  throw new Error('Missing Overseerr configuration in environment variables');
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${OVERSEERR_URL}/api/v1/request/${requestId}`, {
      method: 'DELETE',
      headers: {
        'X-Api-Key': OVERSEERR_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to cancel request' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
