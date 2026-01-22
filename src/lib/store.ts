import { promises as fs } from 'fs';
import path from 'path';
import type { StoreData, Alert, StoredSubscription } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Default empty store
const DEFAULT_STORE: StoreData = {
  subscriptions: {},
  alerts: [],
};

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read store from file
export async function readStore(): Promise<StoreData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(STORE_FILE, 'utf-8');
    return JSON.parse(data) as StoreData;
  } catch {
    // Return default if file doesn't exist
    return { ...DEFAULT_STORE };
  }
}

// Write store to file
export async function writeStore(data: StoreData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Subscription operations
export async function saveSubscription(
  deviceId: string,
  subscription: PushSubscriptionJSON
): Promise<void> {
  const data = await readStore();
  data.subscriptions[deviceId] = {
    deviceId,
    subscription,
    createdAt: Date.now(),
  };
  await writeStore(data);
}

export async function removeSubscription(deviceId: string): Promise<void> {
  const data = await readStore();
  delete data.subscriptions[deviceId];
  await writeStore(data);
}

export async function getAllSubscriptions(): Promise<StoredSubscription[]> {
  const data = await readStore();
  return Object.values(data.subscriptions);
}

// Alert operations
export async function saveAlert(
  deviceId: string,
  alert: Omit<Alert, 'id' | 'deviceId' | 'createdAt' | 'triggered'>
): Promise<Alert> {
  const data = await readStore();

  // Limit alerts per device to 20
  const deviceAlerts = data.alerts.filter(a => a.deviceId === deviceId);
  if (deviceAlerts.length >= 20) {
    throw new Error('Maximum 20 alerts per device');
  }

  const newAlert: Alert = {
    ...alert,
    id: crypto.randomUUID(),
    deviceId,
    triggered: false,
    createdAt: Date.now(),
  };

  data.alerts.push(newAlert);
  await writeStore(data);
  return newAlert;
}

export async function removeAlert(alertId: string, deviceId: string): Promise<boolean> {
  const data = await readStore();
  const initialLength = data.alerts.length;
  data.alerts = data.alerts.filter(
    a => !(a.id === alertId && a.deviceId === deviceId)
  );

  if (data.alerts.length < initialLength) {
    await writeStore(data);
    return true;
  }
  return false;
}

export async function getAlertsByDevice(deviceId: string): Promise<Alert[]> {
  const data = await readStore();
  return data.alerts.filter(a => a.deviceId === deviceId);
}

export async function getAllAlerts(): Promise<Alert[]> {
  const data = await readStore();
  return data.alerts;
}

export async function markAlertTriggered(alertId: string): Promise<void> {
  const data = await readStore();
  const alert = data.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.triggered = true;
    await writeStore(data);
  }
}

export async function resetAlert(alertId: string, deviceId: string): Promise<boolean> {
  const data = await readStore();
  const alert = data.alerts.find(a => a.id === alertId && a.deviceId === deviceId);
  if (alert) {
    alert.triggered = false;
    await writeStore(data);
    return true;
  }
  return false;
}
