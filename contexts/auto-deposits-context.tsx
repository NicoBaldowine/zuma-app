import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchAutoDeposits,
  createAutoDeposit as apiCreate,
  updateAutoDeposit as apiUpdate,
  deleteAutoDeposit as apiDelete,
  pauseAutoDeposit as apiPause,
} from '@/lib/api/auto-deposits';
import type { AutoDepositRule, AutoDepositFrequency, AutoDepositEnd } from '@/types';

type AutoDepositsContextValue = {
  rules: AutoDepositRule[];
  loading: boolean;
  getRuleForBucket: (targetBucketId: string) => AutoDepositRule | undefined;
  createRule: (params: {
    sourceBucketId: string;
    targetBucketId: string;
    amount: number;
    frequency: AutoDepositFrequency;
    endCondition: AutoDepositEnd;
  }) => Promise<AutoDepositRule>;
  updateRule: (id: string, params: Partial<{
    sourceBucketId: string;
    amount: number;
    frequency: AutoDepositFrequency;
    endCondition: AutoDepositEnd;
  }>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  pauseRule: (id: string, paused: boolean) => Promise<void>;
  refresh: () => Promise<void>;
};

const AutoDepositsContext = createContext<AutoDepositsContextValue | null>(null);

export function AutoDepositsProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRules] = useState<AutoDepositRule[]>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchAutoDeposits();
      setRules(data);
    } catch {
      // Silently fail — auto-deposits are non-critical
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    load().finally(() => setLoading(false));
  }, [load]);

  const getRuleForBucket = useCallback(
    (targetBucketId: string) => rules.find((r) => r.targetBucketId === targetBucketId),
    [rules],
  );

  const createRule = useCallback(async (params: {
    sourceBucketId: string;
    targetBucketId: string;
    amount: number;
    frequency: AutoDepositFrequency;
    endCondition: AutoDepositEnd;
  }) => {
    const created = await apiCreate(params);
    setRules((prev) => [...prev, created]);
    return created;
  }, []);

  const updateRule = useCallback(async (id: string, params: Partial<{
    sourceBucketId: string;
    amount: number;
    frequency: AutoDepositFrequency;
    endCondition: AutoDepositEnd;
  }>) => {
    const updated = await apiUpdate(id, params);
    setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    await apiDelete(id);
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const pauseRule = useCallback(async (id: string, paused: boolean) => {
    await apiPause(id, paused);
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isPaused: paused } : r)));
  }, []);

  return (
    <AutoDepositsContext.Provider
      value={{
        rules,
        loading,
        getRuleForBucket,
        createRule,
        updateRule,
        deleteRule,
        pauseRule,
        refresh: load,
      }}
    >
      {children}
    </AutoDepositsContext.Provider>
  );
}

export function useAutoDeposits() {
  const ctx = useContext(AutoDepositsContext);
  if (!ctx) throw new Error('useAutoDeposits must be used within AutoDepositsProvider');
  return ctx;
}
