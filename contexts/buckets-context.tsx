import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth/get-user-id';
import { fetchBuckets, createBucket as apiBucketCreate, updateBucket as apiBucketUpdate, deleteBucket as apiBucketDelete, ensureMainBucket } from '@/lib/api/buckets';
import { moveFunds as apiMoveFunds, addFunds as apiAddFunds } from '@/lib/api/transfers';
import { createTransaction } from '@/lib/api/transactions';
import { computeWallet } from '@/lib/api/wallet';
import { useCelebration } from './celebration-context';
import { useAuth } from './auth-context';
import { getPendingBucket, isOnboardingComplete } from '@/utils/onboarding-store';
import type { Bucket, BucketColorKey, Wallet } from '@/types';

type BucketsContextValue = {
  buckets: Bucket[];
  wallet: Wallet;
  mainBucket: Bucket | undefined;
  savingsBuckets: Bucket[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createBucket: (params: {
    name: string;
    icon: string;
    iconType: 'icon' | 'emoji' | 'pixel';
    colorKey: BucketColorKey;
    customColor?: string;
    targetAmount: number;
  }) => Promise<Bucket>;
  updateBucket: (id: string, params: Partial<{
    name: string;
    icon: string;
    iconType: string;
    colorKey: string;
    customColor: string | null;
    targetAmount: number;
  }>) => Promise<void>;
  deleteBucket: (id: string) => Promise<void>;
  moveFunds: (fromBucketId: string, toBucketId: string, amount: number) => Promise<void>;
  addFunds: (bucketId: string, amount: number, description?: string) => Promise<void>;
};

const BucketsContext = createContext<BucketsContextValue | null>(null);

export function BucketsProvider({ children }: { children: React.ReactNode }) {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { celebrate } = useCelebration();
  const { session } = useAuth();
  const isAuthenticated = !!session;

  const loadBuckets = useCallback(async () => {
    try {
      const data = await fetchBuckets();
      setBuckets(data);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load buckets');
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadBuckets();
  }, [loadBuckets]);

  // Track which session we initialized for, so re-login triggers reload
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentSessionId = session?.user?.id ?? null;

    // Not authenticated
    if (!isAuthenticated) {
      sessionIdRef.current = null;
      // Seed local preview buckets from onboarding data
      if (isOnboardingComplete()) {
        const now = new Date().toISOString();
        const localBuckets: Bucket[] = [
          {
            id: 'local-main',
            name: 'Main',
            icon: 'Wallet',
            iconType: 'icon',
            colorKey: 'neutral',
            currentAmount: 0,
            targetAmount: 0,
            isMain: true,
            createdAt: now,
            order: 0,
          },
        ];
        const pending = getPendingBucket();
        if (pending) {
          localBuckets.push({
            id: 'local-pending',
            name: pending.name,
            icon: pending.icon,
            iconType: pending.iconType,
            colorKey: pending.colorKey,
            customColor: pending.customColor,
            currentAmount: 0,
            targetAmount: pending.targetAmount,
            isMain: false,
            createdAt: now,
            order: 1,
          });
        }
        setBuckets(localBuckets);
      } else {
        setBuckets([]);
      }
      setLoading(false);
      return;
    }

    // Already initialized for this session
    if (sessionIdRef.current === currentSessionId) return;
    sessionIdRef.current = currentSessionId;

    // New session — load from Supabase
    setLoading(true);
    setBuckets([]);

    (async () => {
      try {
        await ensureMainBucket();
        await loadBuckets();
      } catch (err: any) {
        setError(err.message ?? 'Failed to initialize');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, session, loadBuckets]);

  // Realtime subscription on buckets table — debounced to avoid
  // multiple refetches when batch operations (like shift_bucket_orders) fire many events
  const realtimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('buckets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buckets',
          filter: `user_id=eq.${getCurrentUserId()}`,
        },
        () => {
          if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
          realtimeTimerRef.current = setTimeout(() => {
            loadBuckets();
          }, 300);
        },
      )
      .subscribe();

    return () => {
      if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [loadBuckets]);

  const wallet = useMemo(() => computeWallet(buckets, isAuthenticated ? getCurrentUserId() : 'anonymous'), [buckets, isAuthenticated]);
  const mainBucket = useMemo(() => buckets.find((b) => b.isMain), [buckets]);
  const savingsBuckets = useMemo(() => buckets.filter((b) => !b.isMain).sort((a, b) => a.order - b.order), [buckets]);

  const createBucket = useCallback(async (params: {
    name: string;
    icon: string;
    iconType: 'icon' | 'emoji' | 'pixel';
    colorKey: BucketColorKey;
    customColor?: string;
    targetAmount: number;
  }) => {
    const created = await apiBucketCreate(params);
    await loadBuckets();
    return created;
  }, [loadBuckets]);

  const updateBucketFn = useCallback(async (id: string, params: Partial<{
    name: string;
    icon: string;
    iconType: string;
    colorKey: string;
    customColor: string | null;
    targetAmount: number;
  }>) => {
    await apiBucketUpdate(id, params);
    await loadBuckets();
  }, [loadBuckets]);

  const deleteBucketFn = useCallback(async (id: string) => {
    await apiBucketDelete(id);
    await loadBuckets();
  }, [loadBuckets]);

  // Check if a bucket just reached its target after a fund operation
  const checkCompletion = useCallback(async (bucketId: string, prevBuckets: Bucket[]) => {
    const before = prevBuckets.find((b) => b.id === bucketId);
    const updatedBuckets = await fetchBuckets();
    setBuckets(updatedBuckets);

    const after = updatedBuckets.find((b) => b.id === bucketId);
    if (
      after && before && !after.isMain &&
      after.targetAmount > 0 &&
      before.currentAmount < before.targetAmount &&
      after.currentAmount >= after.targetAmount
    ) {
      // Bucket just completed!
      await createTransaction({
        bucketId: after.id,
        type: 'bucket_completed',
        amount: 0,
        description: `${after.name} completed!`,
      });
      celebrate(after.name);
    }
  }, [celebrate]);

  const moveFundsFn = useCallback(async (fromBucketId: string, toBucketId: string, amount: number) => {
    const prevBuckets = buckets;
    await apiMoveFunds({ fromBucketId, toBucketId, amount });
    await checkCompletion(toBucketId, prevBuckets);
  }, [buckets, checkCompletion]);

  const addFundsFn = useCallback(async (bucketId: string, amount: number, description?: string) => {
    const prevBuckets = buckets;
    await apiAddFunds({ bucketId, amount, description });
    await checkCompletion(bucketId, prevBuckets);
  }, [buckets, checkCompletion]);

  return (
    <BucketsContext.Provider
      value={{
        buckets,
        wallet,
        mainBucket,
        savingsBuckets,
        loading,
        error,
        refresh,
        createBucket,
        updateBucket: updateBucketFn,
        deleteBucket: deleteBucketFn,
        moveFunds: moveFundsFn,
        addFunds: addFundsFn,
      }}
    >
      {children}
    </BucketsContext.Provider>
  );
}

export function useBuckets() {
  const ctx = useContext(BucketsContext);
  if (!ctx) throw new Error('useBuckets must be used within BucketsProvider');
  return ctx;
}
