import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState, Transaction, Flock, EggProduction, EggSale, FeedPurchase, FeedConsumption, Vaccination, DiseaseRecord } from '../types';
import { db } from '../db/database';

interface AppContextType {
  state: AppState;
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addFlock: (flock: Omit<Flock, 'id'>) => Promise<void>;
  updateFlock: (flockId: string, updates: Partial<Flock>) => Promise<void>;
  addEggProduction: (production: Omit<EggProduction, 'id' | 'petiCount' | 'remainingEggs'>) => Promise<void>;
  addEggSale: (sale: Omit<EggSale, 'id' | 'totalAmount'>) => Promise<void>;
  purchaseFeed: (purchase: Omit<FeedPurchase, 'id' | 'transactionId' | 'totalCost'>) => Promise<void>;
  consumeFeed: (consumption: Omit<FeedConsumption, 'id'>) => Promise<void>;
  addVaccination: (vaccination: Omit<Vaccination, 'id'>) => Promise<void>;
  updateVaccination: (vaccinationId: string, updates: Partial<Vaccination>) => Promise<void>;
  addDiseaseRecord: (record: Omit<DiseaseRecord, 'id'>) => Promise<void>;
  updateDiseaseRecord: (recordId: string, updates: Partial<DiseaseRecord>) => Promise<void>;
  updateEggPrice: (price: number) => Promise<void>;
  setInitialBalance: (amount: number) => Promise<void>;
  recordMortality: (flockId: string, count: number) => Promise<void>;
  exportTransactionsCSV: () => void;
  exportEggSalesCSV: () => void;
  exportFeedPurchasesCSV: () => void;
  refreshState: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    bankAccount: { balance: 0, borrowedAmount: 0, lastUpdated: '' },
    transactions: [],
    flocks: [],
    eggProductions: [],
    eggSales: [],
    eggInventory: { totalEggs: 0, totalPeti: 0, remainingEggs: 0, lastUpdated: '' },
    feedStocks: [],
    feedPurchases: [],
    feedConsumptions: [],
    vaccinations: [],
    diseaseRecords: [],
    eggPrice: { pricePerPeti: 2500, lastUpdated: '' },
    labourList: [],
    labourPayments: []
  });
  const [loading, setLoading] = useState(true);

  const refreshState = async () => {
    const currentState = await db.getState();
    setState(currentState);
  };

  useEffect(() => {
    const initDB = async () => {
      await db.init();
      const currentState = await db.getState();
      setState(currentState);
      setLoading(false);
    };
    initDB();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newState = await db.addTransaction(state, transaction);
    setState(newState);
  };

  const addFlock = async (flock: Omit<Flock, 'id'>) => {
    const newState = await db.addFlock(state, flock);
    setState(newState);
  };

  const updateFlock = async (flockId: string, updates: Partial<Flock>) => {
    const newState = await db.updateFlock(state, flockId, updates);
    setState(newState);
  };

  const addEggProduction = async (production: Omit<EggProduction, 'id' | 'petiCount' | 'remainingEggs'>) => {
    const newState = await db.addEggProduction(state, production);
    setState(newState);
  };

  const addEggSale = async (sale: Omit<EggSale, 'id' | 'totalAmount'>) => {
    const newState = await db.addEggSale(state, sale);
    setState(newState);
  };

  const purchaseFeed = async (purchase: Omit<FeedPurchase, 'id' | 'transactionId' | 'totalCost'>) => {
    const newState = await db.purchaseFeed(state, purchase);
    setState(newState);
  };

  const consumeFeed = async (consumption: Omit<FeedConsumption, 'id'>) => {
    const newState = await db.consumeFeed(state, consumption);
    setState(newState);
  };

  const addVaccination = async (vaccination: Omit<Vaccination, 'id'>) => {
    const newState = await db.addVaccination(state, vaccination);
    setState(newState);
  };

  const updateVaccination = async (vaccinationId: string, updates: Partial<Vaccination>) => {
    const newState = await db.updateVaccination(state, vaccinationId, updates);
    setState(newState);
  };

  const addDiseaseRecord = async (record: Omit<DiseaseRecord, 'id'>) => {
    const newState = await db.addDiseaseRecord(state, record);
    setState(newState);
  };

  const updateDiseaseRecord = async (recordId: string, updates: Partial<DiseaseRecord>) => {
    const newState = await db.updateDiseaseRecord(state, recordId, updates);
    setState(newState);
  };

  const updateEggPrice = async (price: number) => {
    const newState = await db.updateEggPrice(state, price);
    setState(newState);
  };

  const setInitialBalance = async (amount: number) => {
    const newState = await db.setInitialBalance(state, amount);
    setState(newState);
  };

  const recordMortality = async (flockId: string, count: number) => {
    const newState = await db.recordMortality(state, flockId, count);
    setState(newState);
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTransactionsCSV = () => {
    const csv = db.exportTransactionsToCSV(state.transactions);
    downloadCSV(csv, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportEggSalesCSV = () => {
    const csv = db.exportEggSalesToCSV(state.eggSales);
    downloadCSV(csv, `egg_sales_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportFeedPurchasesCSV = () => {
    const csv = db.exportFeedPurchasesToCSV(state.feedPurchases);
    downloadCSV(csv, `feed_purchases_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <AppContext.Provider value={{
      state,
      loading,
      addTransaction,
      addFlock,
      updateFlock,
      addEggProduction,
      addEggSale,
      purchaseFeed,
      consumeFeed,
      addVaccination,
      updateVaccination,
      addDiseaseRecord,
      updateDiseaseRecord,
      updateEggPrice,
      setInitialBalance,
      recordMortality,
      exportTransactionsCSV,
      exportEggSalesCSV,
      exportFeedPurchasesCSV,
      refreshState
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
