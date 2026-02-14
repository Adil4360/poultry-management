// Database Types for Layers Poultry Management System

export interface Transaction {
  id: string;
  date: string;
  type: 'credit' | 'debit';
  amount: number;
  source: string;
  linkedCompany: 'Chairman Feed' | 'Chairman Hatchery' | 'Chairman Group' | 'External';
  description: string;
  category: 'feed_purchase' | 'egg_sale' | 'medication' | 'labor' | 'utilities' | 'other' | 'initial_balance' | 'bird_purchase' | 'labour_payment';
}

export interface BankAccount {
  balance: number;
  borrowedAmount: number;
  lastUpdated: string;
}

export interface Flock {
  id: string;
  breed: string;
  numberOfLayers: number;
  ageWeeks: number;
  startDate: string;
  mortality: number;
  isActive: boolean;
}

export interface EggProduction {
  id: string;
  date: string;
  flockId: string;
  totalEggs: number;
  brokenEggs: number;
  goodEggs: number;
  petiCount: number;
  remainingEggs: number;
}

export interface EggSale {
  id: string;
  date: string;
  petiCount: number;
  pricePerPeti: number;
  totalAmount: number;
  buyerName: string;
}

export interface EggInventory {
  totalEggs: number;
  totalPeti: number;
  remainingEggs: number;
  lastUpdated: string;
}

export interface FeedStock {
  id: string;
  feedType: string;
  bagsInStock: number;
  bagSize: number; // Always 50kg
  costPerBag: number;
  lastPurchaseDate: string;
}

export interface FeedPurchase {
  id: string;
  date: string;
  feedType: string;
  bags: number;
  costPerBag: number;
  totalCost: number;
  transactionId: string;
}

export interface FeedConsumption {
  id: string;
  date: string;
  feedType: string;
  bagsUsed: number;
  flockId: string;
}

export interface Vaccination {
  id: string;
  flockId: string;
  vaccineName: string;
  scheduledDate: string;
  administeredDate: string | null;
  status: 'scheduled' | 'completed' | 'overdue';
  notes: string;
}

export interface DiseaseRecord {
  id: string;
  flockId: string;
  diseaseName: string;
  dateDetected: string;
  affectedBirds: number;
  treatmentCost: number;
  treatment: string;
  status: 'active' | 'resolved';
}

export interface EggPrice {
  pricePerPeti: number;
  lastUpdated: string;
}

export interface Labour {
  id: string;
  name: string;
  role: string;
  wageType: 'daily' | 'monthly';
  wageAmount: number;
  joiningDate: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface LabourPayment {
  id: string;
  labourId: string;
  date: string;
  amount: number;
  notes: string;
  transactionId: string;
}

export interface AppState {
  bankAccount: BankAccount;
  transactions: Transaction[];
  flocks: Flock[];
  eggProductions: EggProduction[];
  eggSales: EggSale[];
  eggInventory: EggInventory;
  feedStocks: FeedStock[];
  feedPurchases: FeedPurchase[];
  feedConsumptions: FeedConsumption[];
  vaccinations: Vaccination[];
  diseaseRecords: DiseaseRecord[];
  eggPrice: EggPrice;
  labourList: Labour[];
  labourPayments: LabourPayment[];
}
