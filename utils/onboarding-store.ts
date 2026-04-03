import type { BucketColorKey } from '@/types';

export type PendingBucket = {
  name: string;
  icon: string;
  iconType: 'icon' | 'emoji' | 'pixel';
  colorKey: BucketColorKey;
  customColor?: string;
  targetAmount: number;
};

let onboardingComplete = false;
let pendingBucket: PendingBucket | null = null;
let listeners: (() => void)[] = [];

export function isOnboardingComplete() {
  return onboardingComplete;
}

export function completeOnboarding() {
  onboardingComplete = true;
  listeners.forEach((fn) => fn());
}

export function resetOnboarding() {
  onboardingComplete = false;
  pendingBucket = null;
  listeners.forEach((fn) => fn());
}

export function setPendingBucket(bucket: PendingBucket) {
  pendingBucket = bucket;
}

export function getPendingBucket(): PendingBucket | null {
  return pendingBucket;
}

export function clearPendingBucket() {
  pendingBucket = null;
}

export function onOnboardingChange(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
