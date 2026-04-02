import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchTransactionsByBucket, fetchAllTransactions } from '@/lib/api/transactions';
import type { Transaction } from '@/types';

type TransactionsContextValue = {
  getTransactions: (bucketId: string) => Transaction[];
  allTransactions: Transaction[];
  loadTransactionsForBucket: (bucketId: string) => Promise<void>;
  loadAllTransactions: () => Promise<void>;
  loadingBucket: string | null;
  loadingAll: boolean;
};

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [byBucket, setByBucket] = useState<Record<string, Transaction[]>>({});
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loadingBucket, setLoadingBucket] = useState<string | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);

  const loadTransactionsForBucket = useCallback(async (bucketId: string) => {
    setLoadingBucket(bucketId);
    try {
      const txns = await fetchTransactionsByBucket(bucketId);
      setByBucket((prev) => ({ ...prev, [bucketId]: txns }));
    } finally {
      setLoadingBucket(null);
    }
  }, []);

  const loadAllTransactions = useCallback(async () => {
    setLoadingAll(true);
    try {
      const txns = await fetchAllTransactions();
      setAllTransactions(txns);
    } finally {
      setLoadingAll(false);
    }
  }, []);

  const getTransactions = useCallback(
    (bucketId: string) => byBucket[bucketId] ?? [],
    [byBucket],
  );

  return (
    <TransactionsContext.Provider
      value={{
        getTransactions,
        allTransactions,
        loadTransactionsForBucket,
        loadAllTransactions,
        loadingBucket,
        loadingAll,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionsProvider');
  return ctx;
}
