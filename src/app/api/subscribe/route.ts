import { NextRequest, NextResponse } from 'next/server';
import { saveSubscription, removeSubscription } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, subscription } = body;

    if (!deviceId || !subscription) {
      return NextResponse.json(
        { error: 'Missing deviceId or subscription' },
        { status: 400 }
      );
    }

    if (!subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription: missing endpoint' },
        { status: 400 }
      );
    }

    await saveSubscription(deviceId, subscription);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Missing deviceId' },
        { status: 400 }
      );
    }

    await removeSubscription(deviceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
