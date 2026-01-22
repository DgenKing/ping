import { NextRequest, NextResponse } from 'next/server';
import { getAlertsByDevice, saveAlert, removeAlert, resetAlert } from '@/lib/store';
import type { CoinId, AlertCondition } from '@/types';
import { COIN_MAP } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.headers.get('x-device-id');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Missing device ID' },
        { status: 400 }
      );
    }

    const alerts = await getAlertsByDevice(deviceId);

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to get alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const deviceId = request.headers.get('x-device-id');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Missing device ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { coin, condition, targetPrice } = body as {
      coin: CoinId;
      condition: AlertCondition;
      targetPrice: number;
    };

    // Validate
    if (!coin || !condition || typeof targetPrice !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!COIN_MAP[coin]) {
      return NextResponse.json(
        { error: 'Invalid coin' },
        { status: 400 }
      );
    }

    if (condition !== 'above' && condition !== 'below') {
      return NextResponse.json(
        { error: 'Invalid condition' },
        { status: 400 }
      );
    }

    if (targetPrice <= 0) {
      return NextResponse.json(
        { error: 'Target price must be positive' },
        { status: 400 }
      );
    }

    const alert = await saveAlert(deviceId, {
      coin,
      coinSymbol: COIN_MAP[coin].symbol,
      condition,
      targetPrice,
    });

    return NextResponse.json({ alert });
  } catch (error) {
    console.error('Create alert error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create alert';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const deviceId = request.headers.get('x-device-id');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Missing device ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: 'Missing alert ID' },
        { status: 400 }
      );
    }

    const deleted = await removeAlert(alertId, deviceId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete alert error:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const deviceId = request.headers.get('x-device-id');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Missing device ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { alertId, action } = body;

    if (!alertId || action !== 'reset') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const reset = await resetAlert(alertId, deviceId);

    if (!reset) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset alert error:', error);
    return NextResponse.json(
      { error: 'Failed to reset alert' },
      { status: 500 }
    );
  }
}
