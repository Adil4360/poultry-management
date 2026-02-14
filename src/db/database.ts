// IndexedDB Database for Shafqat Poultry Farm - Layers Management
// Note: Chairman Group, Chairman Feed, Chairman Hatchery are EXTERNAL entities/suppliers
import { AppState, Transaction, Flock, EggProduction, EggSale, FeedStock, FeedPurchase, FeedConsumption, Vaccination, DiseaseRecord, Labour, LabourPayment } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Re-export types for convenience
export type { AppState, Transaction, Flock, EggProduction, EggSale, FeedStock, FeedPurchase, FeedConsumption, Vaccination, DiseaseRecord, Labour, LabourPayment };

const DB_NAME = 'ShafqatPoultryDB';
const DB_VERSION = 1;
const STORE_NAME = 'appState';

const defaultState: AppState = {
  bankAccount: {
    balance: 0,
    borrowedAmount: 0,
    lastUpdated: new Date().toISOString()
  },
  transactions: [],
  flocks: [],
  eggProductions: [],
  eggSales: [],
  eggInventory: {
    totalEggs: 0,
    totalPeti: 0,
    remainingEggs: 0,
    lastUpdated: new Date().toISOString()
  },
  feedStocks: [],
  feedPurchases: [],
  feedConsumptions: [],
  vaccinations: [],
  diseaseRecords: [],
  eggPrice: {
    pricePerPeti: 2500,
    lastUpdated: new Date().toISOString()
  },
  labourList: [],
  labourPayments: []
};

class Database {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async getState(): Promise<AppState> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('state');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || defaultState);
      };
    });
  }

  async saveState(state: AppState): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(state, 'state');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Transaction Methods
  async addTransaction(state: AppState, transaction: Omit<Transaction, 'id'>): Promise<AppState> {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4()
    };

    const newBalance = transaction.type === 'credit' 
      ? state.bankAccount.balance + transaction.amount
      : state.bankAccount.balance - transaction.amount;

    const newBorrowed = newBalance < 0 ? Math.abs(newBalance) : 0;

    const newState: AppState = {
      ...state,
      transactions: [...state.transactions, newTransaction],
      bankAccount: {
        balance: newBalance,
        borrowedAmount: newBorrowed,
        lastUpdated: new Date().toISOString()
      }
    };

    await this.saveState(newState);
    return newState;
  }

  // Flock Methods
  async addFlock(state: AppState, flock: Omit<Flock, 'id'>): Promise<AppState> {
    const newFlock: Flock = {
      ...flock,
      id: uuidv4()
    };

    const newState: AppState = {
      ...state,
      flocks: [...state.flocks, newFlock]
    };

    await this.saveState(newState);
    return newState;
  }

  async updateFlock(state: AppState, flockId: string, updates: Partial<Flock>): Promise<AppState> {
    const newState: AppState = {
      ...state,
      flocks: state.flocks.map(f => f.id === flockId ? { ...f, ...updates } : f)
    };

    await this.saveState(newState);
    return newState;
  }

  // Egg Production Methods
  async addEggProduction(state: AppState, production: Omit<EggProduction, 'id' | 'petiCount' | 'remainingEggs'>): Promise<AppState> {
    const goodEggs = production.goodEggs;
    const totalWithExisting = state.eggInventory.remainingEggs + goodEggs;
    const petiCount = Math.floor(totalWithExisting / 360);
    const remainingEggs = totalWithExisting % 360;

    const newProduction: EggProduction = {
      ...production,
      id: uuidv4(),
      petiCount,
      remainingEggs
    };

    const newState: AppState = {
      ...state,
      eggProductions: [...state.eggProductions, newProduction],
      eggInventory: {
        totalEggs: state.eggInventory.totalEggs + goodEggs,
        totalPeti: state.eggInventory.totalPeti + petiCount,
        remainingEggs,
        lastUpdated: new Date().toISOString()
      }
    };

    await this.saveState(newState);
    return newState;
  }

  // Egg Sale Methods - Credits to our farm account from external buyers
  async addEggSale(state: AppState, sale: Omit<EggSale, 'id' | 'totalAmount'>): Promise<AppState> {
    const totalAmount = sale.petiCount * sale.pricePerPeti;
    
    const newSale: EggSale = {
      ...sale,
      id: uuidv4(),
      totalAmount
    };

    // Update inventory
    const eggsToDeduct = sale.petiCount * 360;
    const newTotalEggs = state.eggInventory.totalEggs - eggsToDeduct;
    const newTotalPeti = Math.floor(newTotalEggs / 360);
    const newRemaining = newTotalEggs % 360;

    // Add credit transaction - money coming INTO our farm
    const transactionId = uuidv4();
    const newTransaction: Transaction = {
      id: transactionId,
      date: sale.date,
      type: 'credit',
      amount: totalAmount,
      source: `Egg Sale - ${sale.petiCount} Peti to ${sale.buyerName}`,
      linkedCompany: 'External', // Sales to external buyers
      description: `Sold ${sale.petiCount} peti at Rs.${sale.pricePerPeti}/peti`,
      category: 'egg_sale'
    };

    const newBalance = state.bankAccount.balance + totalAmount;
    const newBorrowed = newBalance < 0 ? Math.abs(newBalance) : 0;

    const newState: AppState = {
      ...state,
      eggSales: [...state.eggSales, newSale],
      transactions: [...state.transactions, newTransaction],
      bankAccount: {
        balance: newBalance,
        borrowedAmount: newBorrowed,
        lastUpdated: new Date().toISOString()
      },
      eggInventory: {
        totalEggs: Math.max(0, newTotalEggs),
        totalPeti: Math.max(0, newTotalPeti),
        remainingEggs: Math.max(0, newRemaining),
        lastUpdated: new Date().toISOString()
      }
    };

    await this.saveState(newState);
    return newState;
  }

  // Feed Stock Methods
  async addFeedStock(state: AppState, feedStock: Omit<FeedStock, 'id'>): Promise<AppState> {
    const existing = state.feedStocks.find(f => f.feedType === feedStock.feedType);
    
    let newState: AppState;
    if (existing) {
      newState = {
        ...state,
        feedStocks: state.feedStocks.map(f => 
          f.feedType === feedStock.feedType 
            ? { ...f, bagsInStock: f.bagsInStock + feedStock.bagsInStock, costPerBag: feedStock.costPerBag, lastPurchaseDate: feedStock.lastPurchaseDate }
            : f
        )
      };
    } else {
      newState = {
        ...state,
        feedStocks: [...state.feedStocks, { ...feedStock, id: uuidv4() }]
      };
    }

    await this.saveState(newState);
    return newState;
  }

  // Feed Purchase Methods - Purchasing from EXTERNAL supplier (Chairman Feed)
  async purchaseFeed(state: AppState, purchase: Omit<FeedPurchase, 'id' | 'transactionId' | 'totalCost'>): Promise<AppState> {
    const totalCost = purchase.bags * purchase.costPerBag;
    const transactionId = uuidv4();

    const newPurchase: FeedPurchase = {
      ...purchase,
      id: uuidv4(),
      transactionId,
      totalCost
    };

    // Debit transaction - money going OUT to external supplier Chairman Feed
    const newTransaction: Transaction = {
      id: transactionId,
      date: purchase.date,
      type: 'debit',
      amount: totalCost,
      source: `Feed Purchase - ${purchase.bags} bags of ${purchase.feedType}`,
      linkedCompany: 'Chairman Feed', // External supplier
      description: `Purchased ${purchase.bags} bags (50kg each) at Rs.${purchase.costPerBag}/bag from Chairman Feed (External Supplier)`,
      category: 'feed_purchase'
    };

    const newBalance = state.bankAccount.balance - totalCost;
    // If balance goes negative, we're borrowing from Chairman Group (external entity)
    const newBorrowed = newBalance < 0 ? Math.abs(newBalance) : 0;

    // Update feed stock
    const existingStock = state.feedStocks.find(f => f.feedType === purchase.feedType);
    let newFeedStocks: FeedStock[];
    
    if (existingStock) {
      newFeedStocks = state.feedStocks.map(f =>
        f.feedType === purchase.feedType
          ? { ...f, bagsInStock: f.bagsInStock + purchase.bags, costPerBag: purchase.costPerBag, lastPurchaseDate: purchase.date }
          : f
      );
    } else {
      newFeedStocks = [...state.feedStocks, {
        id: uuidv4(),
        feedType: purchase.feedType,
        bagsInStock: purchase.bags,
        bagSize: 50,
        costPerBag: purchase.costPerBag,
        lastPurchaseDate: purchase.date
      }];
    }

    const newState: AppState = {
      ...state,
      feedPurchases: [...state.feedPurchases, newPurchase],
      transactions: [...state.transactions, newTransaction],
      feedStocks: newFeedStocks,
      bankAccount: {
        balance: newBalance,
        borrowedAmount: newBorrowed,
        lastUpdated: new Date().toISOString()
      }
    };

    await this.saveState(newState);
    return newState;
  }

  // Feed Consumption
  async consumeFeed(state: AppState, consumption: Omit<FeedConsumption, 'id'>): Promise<AppState> {
    const newConsumption: FeedConsumption = {
      ...consumption,
      id: uuidv4()
    };

    const newFeedStocks = state.feedStocks.map(f =>
      f.feedType === consumption.feedType
        ? { ...f, bagsInStock: Math.max(0, f.bagsInStock - consumption.bagsUsed) }
        : f
    );

    const newState: AppState = {
      ...state,
      feedConsumptions: [...state.feedConsumptions, newConsumption],
      feedStocks: newFeedStocks
    };

    await this.saveState(newState);
    return newState;
  }

  // Vaccination Methods
  async addVaccination(state: AppState, vaccination: Omit<Vaccination, 'id'>): Promise<AppState> {
    const newVaccination: Vaccination = {
      ...vaccination,
      id: uuidv4()
    };

    const newState: AppState = {
      ...state,
      vaccinations: [...state.vaccinations, newVaccination]
    };

    await this.saveState(newState);
    return newState;
  }

  async updateVaccination(state: AppState, vaccinationId: string, updates: Partial<Vaccination>): Promise<AppState> {
    const newState: AppState = {
      ...state,
      vaccinations: state.vaccinations.map(v => v.id === vaccinationId ? { ...v, ...updates } : v)
    };

    await this.saveState(newState);
    return newState;
  }

  // Disease Record Methods
  async addDiseaseRecord(state: AppState, record: Omit<DiseaseRecord, 'id'>): Promise<AppState> {
    const newRecord: DiseaseRecord = {
      ...record,
      id: uuidv4()
    };

    // Add treatment cost as debit - external medical expense
    let newState: AppState = {
      ...state,
      diseaseRecords: [...state.diseaseRecords, newRecord]
    };

    if (record.treatmentCost > 0) {
      const newTransaction: Transaction = {
        id: uuidv4(),
        date: record.dateDetected,
        type: 'debit',
        amount: record.treatmentCost,
        source: `Treatment for ${record.diseaseName}`,
        linkedCompany: 'External', // External medical expenses
        description: record.treatment,
        category: 'medication'
      };

      const newBalance = state.bankAccount.balance - record.treatmentCost;
      const newBorrowed = newBalance < 0 ? Math.abs(newBalance) : 0;

      newState = {
        ...newState,
        transactions: [...newState.transactions, newTransaction],
        bankAccount: {
          balance: newBalance,
          borrowedAmount: newBorrowed,
          lastUpdated: new Date().toISOString()
        }
      };
    }

    await this.saveState(newState);
    return newState;
  }

  async updateDiseaseRecord(state: AppState, recordId: string, updates: Partial<DiseaseRecord>): Promise<AppState> {
    const newState: AppState = {
      ...state,
      diseaseRecords: state.diseaseRecords.map(r => r.id === recordId ? { ...r, ...updates } : r)
    };

    await this.saveState(newState);
    return newState;
  }

  // Update Egg Price
  async updateEggPrice(state: AppState, pricePerPeti: number): Promise<AppState> {
    const newState: AppState = {
      ...state,
      eggPrice: {
        pricePerPeti,
        lastUpdated: new Date().toISOString()
      }
    };

    await this.saveState(newState);
    return newState;
  }

  // Add Initial Balance - Could be from Chairman Group (external credit)
  async setInitialBalance(state: AppState, amount: number): Promise<AppState> {
    const newTransaction: Transaction = {
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      type: 'credit',
      amount,
      source: 'Balance Added',
      linkedCompany: 'Chairman Group', // External entity providing credit
      description: 'Funds received from Chairman Group (External)',
      category: 'initial_balance'
    };

    const newState: AppState = {
      ...state,
      transactions: [...state.transactions, newTransaction],
      bankAccount: {
        balance: state.bankAccount.balance + amount,
        borrowedAmount: Math.max(0, state.bankAccount.borrowedAmount - amount),
        lastUpdated: new Date().toISOString()
      }
    };

    await this.saveState(newState);
    return newState;
  }

  // Record Mortality
  async recordMortality(state: AppState, flockId: string, count: number): Promise<AppState> {
    const newState: AppState = {
      ...state,
      flocks: state.flocks.map(f => 
        f.id === flockId 
          ? { ...f, mortality: f.mortality + count, numberOfLayers: Math.max(0, f.numberOfLayers - count) }
          : f
      )
    };

    await this.saveState(newState);
    return newState;
  }

  // Export to CSV
  exportTransactionsToCSV(transactions: Transaction[]): string {
    const headers = ['Date', 'Type', 'Amount', 'Source', 'Linked Company', 'Description', 'Category'];
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.amount.toString(),
      t.source,
      t.linkedCompany,
      t.description,
      t.category
    ]);

    return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  }

  exportEggSalesToCSV(sales: EggSale[]): string {
    const headers = ['Date', 'Peti Count', 'Price per Peti', 'Total Amount', 'Buyer Name'];
    const rows = sales.map(s => [
      s.date,
      s.petiCount.toString(),
      s.pricePerPeti.toString(),
      s.totalAmount.toString(),
      s.buyerName
    ]);

    return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  }

  exportFeedPurchasesToCSV(purchases: FeedPurchase[]): string {
    const headers = ['Date', 'Feed Type', 'Bags', 'Cost per Bag', 'Total Cost'];
    const rows = purchases.map(p => [
      p.date,
      p.feedType,
      p.bags.toString(),
      p.costPerBag.toString(),
      p.totalCost.toString()
    ]);

    return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  }
}

export const db = new Database();
