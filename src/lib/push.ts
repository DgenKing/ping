import webpush from 'web-push';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } from './config';
import { getAllSubscriptions } from './store';

// Configure web-push
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

// Send push notification to a single subscription
export async function sendPush(
  subscription: PushSubscriptionJSON,
  payload: PushPayload
): Promise<boolean> {
  try {
    if (!subscription.endpoint) {
      console.error('Invalid subscription: missing endpoint');
      return false;
    }

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys as { p256dh: string; auth: string },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icons/icon-192.png',
        badge: payload.badge || '/icons/icon-192.png',
        tag: payload.tag || 'ping-alert',
        data: payload.data || {},
      })
    );
    return true;
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    // Handle expired/invalid subscriptions
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log('Subscription expired or invalid');
    } else {
      console.error('Push failed:', error);
    }
    return false;
  }
}

// Send push to all subscriptions
export async function sendPushToAll(payload: PushPayload): Promise<number> {
  const subscriptions = await getAllSubscriptions();
  let successCount = 0;

  for (const sub of subscriptions) {
    const success = await sendPush(sub.subscription, payload);
    if (success) successCount++;
  }

  return successCount;
}

// Send push to specific device
export async function sendPushToDevice(
  deviceId: string,
  payload: PushPayload
): Promise<boolean> {
  const subscriptions = await getAllSubscriptions();
  const subscription = subscriptions.find(s => s.deviceId === deviceId);

  if (!subscription) {
    console.log(`No subscription found for device: ${deviceId}`);
    return false;
  }

  return sendPush(subscription.subscription, payload);
}
