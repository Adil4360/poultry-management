import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Egg,
  Wheat,
  Bird,
  Users,
  FileText,
  Plus,
  X,
  Calendar
} from 'lucide-react';

interface FinanceTransaction {
  id?: number;
  date: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  reference_id?: number;
}

interface FinanceEggSale {
  id?: number;
  date: string;
  peti: number;
  price_per_peti: number;
  total_eggs: number;
  total_amount: number;
  buyer: string;
}

interface FinanceFeedPurchase {
  id?: number;
  date: string;
  feed_type: string;
  bags: number;
  price_per_bag: number;
  total_cost: number;
}

interface FinanceFlock {
  id?: number;
  name: string;
  breed: string;
  quantity: number;
  age_weeks: number;
  purchase_date: string;
  purchase_price: number;
  status: string;
}

interface FinanceWorker {
  id?: number;
  name: string;
  role: string;
  wage_type: string;
  wage_amount: number;
  join_date: string;
  phone: string;
  status: string;
}

interface FinanceLabourPayment {
  id?: number;
  worker_id: number;
  worker_name?: string;
  worker_role?: string;
  amount: number;
  date: string;
  notes: string;
}

export function Finance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Data states
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [eggSales, setEggSales] = useState<FinanceEggSale[]>([]);
  const [feedPurchases, setFeedPurchases] = useState<FinanceFeedPurchase[]>([]);
  const [flocks, setFlocks] = useState<FinanceFlock[]>([]);
  const [workers, setWorkers] = useState<FinanceWorker[]>([]);
  const [labourPayments, setLabourPayments] = useState<FinanceLabourPayment[]>([]);
  
  // Form states
  const [eggForm, setEggForm] = useState({ buyer: '', peti: '', price: '', date: new Date().toISOString().split('T')[0] });
  const [feedForm, setFeedForm] = useState({ type: 'Layer Feed', bags: '', price: '', date: new Date().toISOString().split('T')[0] });
  const [hatcheryForm, setHatcheryForm] = useState({ breed: '', birds: '', price: '', notes: '', date: new Date().toISOString().split('T')[0] });
  const [labourForm, setLabourForm] = useState({ worker_id: '', amount: '', notes: '', date: new Date().toISOString().split('T')[0] });
  const [otherForm, setOtherForm] = useState({ description: '', amount: '', type: 'debit', date: new Date().toISOString().split('T')[0] });

  // Load data from localStorage
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    const storedTransactions = localStorage.getItem('finance_transactions');
    const storedEggSales = localStorage.getItem('finance_egg_sales');
    const storedFeedPurchases = localStorage.getItem('finance_feed_purchases');
    const storedFlocks = localStorage.getItem('finance_flocks');
    const storedWorkers = localStorage.getItem('finance_workers');
    const storedLabourPayments = localStorage.getItem('finance_labour_payments');

    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
    if (storedEggSales) setEggSales(JSON.parse(storedEggSales));
    if (storedFeedPurchases) setFeedPurchases(JSON.parse(storedFeedPurchases));
    if (storedFlocks) setFlocks(JSON.parse(storedFlocks));
    if (storedWorkers) setWorkers(JSON.parse(storedWorkers));
    if (storedLabourPayments) setLabourPayments(JSON.parse(storedLabourPayments));
  };

  const saveToStorage = (key: string, data: unknown) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addTransaction = (transaction: FinanceTransaction) => {
    const newTransaction = { ...transaction, id: Date.now() };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    saveToStorage('finance_transactions', updated);
    
    // Update Chairman Group balance in localStorage
    const currentBalance = parseFloat(localStorage.getItem('chairman_balance') || '0');
    const newBalance = transaction.type === 'credit' 
      ? currentBalance + transaction.amount 
      : currentBalance - transaction.amount;
    localStorage.setItem('chairman_balance', newBalance.toString());
  };

  // Add Egg Sale
  const handleAddEggSale = () => {
    if (!eggForm.buyer || !eggForm.peti || !eggForm.price) return;
    
    const peti = parseInt(eggForm.peti);
    const price = parseFloat(eggForm.price);
    const totalEggs = peti * 360;
    const totalAmount = peti * price;

    const newSale: FinanceEggSale = {
      id: Date.now(),
      date: eggForm.date,
      buyer: eggForm.buyer,
      peti,
      price_per_peti: price,
      total_eggs: totalEggs,
      total_amount: totalAmount
    };

    const updatedSales = [newSale, ...eggSales];
    setEggSales(updatedSales);
    saveToStorage('finance_egg_sales', updatedSales);

    // Auto credit Chairman Group
    addTransaction({
      date: eggForm.date,
      type: 'credit',
      amount: totalAmount,
      description: `Egg Sale to ${eggForm.buyer} - ${peti} Peti`,
      category: 'egg_sale'
    });

    setEggForm({ buyer: '', peti: '', price: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(false);
  };

  // Add Feed Purchase
  const handleAddFeedPurchase = () => {
    if (!feedForm.bags || !feedForm.price) return;
    
    const bags = parseInt(feedForm.bags);
    const price = parseFloat(feedForm.price);
    const totalCost = bags * price;

    const newPurchase: FinanceFeedPurchase = {
      id: Date.now(),
      date: feedForm.date,
      feed_type: feedForm.type,
      bags,
      price_per_bag: price,
      total_cost: totalCost
    };

    const updatedPurchases = [newPurchase, ...feedPurchases];
    setFeedPurchases(updatedPurchases);
    saveToStorage('finance_feed_purchases', updatedPurchases);

    // Auto debit Chairman Group
    addTransaction({
      date: feedForm.date,
      type: 'debit',
      amount: totalCost,
      description: `Feed Purchase - ${bags} bags of ${feedForm.type}`,
      category: 'feed_purchase'
    });

    setFeedForm({ type: 'Layer Feed', bags: '', price: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(false);
  };

  // Add Bird Purchase
  const handleAddBirdPurchase = () => {
    if (!hatcheryForm.breed || !hatcheryForm.birds || !hatcheryForm.price) return;
    
    const birds = parseInt(hatcheryForm.birds);
    const price = parseFloat(hatcheryForm.price);
    const totalCost = birds * price;

    const newFlock: FinanceFlock = {
      id: Date.now(),
      name: `Flock-${Date.now()}`,
      breed: hatcheryForm.breed,
      quantity: birds,
      age_weeks: 0,
      purchase_date: hatcheryForm.date,
      purchase_price: totalCost,
      status: 'active'
    };

    const updatedFlocks = [newFlock, ...flocks];
    setFlocks(updatedFlocks);
    saveToStorage('finance_flocks', updatedFlocks);

    // Auto debit Chairman Group
    addTransaction({
      date: hatcheryForm.date,
      type: 'debit',
      amount: totalCost,
      description: `Bird Purchase - ${birds} ${hatcheryForm.breed} from Chairman Hatchery`,
      category: 'bird_purchase'
    });

    setHatcheryForm({ breed: '', birds: '', price: '', notes: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(false);
  };

  // Add Worker
  const handleAddWorker = (workerData: Partial<FinanceWorker>) => {
    const newWorker: FinanceWorker = {
      id: Date.now(),
      name: workerData.name || '',
      role: workerData.role || '',
      wage_type: workerData.wage_type || 'daily',
      wage_amount: workerData.wage_amount || 0,
      join_date: workerData.join_date || new Date().toISOString().split('T')[0],
      phone: workerData.phone || '',
      status: 'active'
    };

    const updatedWorkers = [newWorker, ...workers];
    setWorkers(updatedWorkers);
    saveToStorage('finance_workers', updatedWorkers);
  };

  // Add Labour Payment
  const handleAddLabourPayment = () => {
    if (!labourForm.worker_id || !labourForm.amount) return;
    
    const worker = workers.find(w => w.id === parseInt(labourForm.worker_id));
    if (!worker) return;

    const amount = parseFloat(labourForm.amount);

    const newPayment: FinanceLabourPayment = {
      id: Date.now(),
      worker_id: worker.id!,
      worker_name: worker.name,
      worker_role: worker.role,
      amount,
      date: labourForm.date,
      notes: labourForm.notes
    };

    const updatedPayments = [newPayment, ...labourPayments];
    setLabourPayments(updatedPayments);
    saveToStorage('finance_labour_payments', updatedPayments);

    // Auto debit Chairman Group
    addTransaction({
      date: labourForm.date,
      type: 'debit',
      amount,
      description: `Labour Payment - ${worker.name} (${worker.role})`,
      category: 'labour_payment'
    });

    setLabourForm({ worker_id: '', amount: '', notes: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(false);
  };

  // Add Other Transaction
  const handleAddOtherTransaction = () => {
    if (!otherForm.description || !otherForm.amount) return;
    
    const amount = parseFloat(otherForm.amount);

    addTransaction({
      date: otherForm.date,
      type: otherForm.type as 'credit' | 'debit',
      amount,
      description: otherForm.description,
      category: 'other'
    });

    setOtherForm({ description: '', amount: '', type: 'debit', date: new Date().toISOString().split('T')[0] });
    setShowModal(false);
  };

  // Calculate totals
  const totalEggRevenue = eggSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalFeedCost = feedPurchases.reduce((sum, p) => sum + p.total_cost, 0);
  const totalHatcheryCost = flocks.reduce((sum, f) => sum + f.purchase_price, 0);
  const totalLabourCost = labourPayments.reduce((sum, p) => sum + p.amount, 0);
  const netProfit = totalEggRevenue - totalFeedCost - totalHatcheryCost - totalLabourCost;

  const openModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'eggs', label: 'Egg Sales', icon: Egg },
    { id: 'feed', label: 'Feed', icon: Wheat },
    { id: 'hatchery', label: 'Hatchery', icon: Bird },
    { id: 'labour', label: 'Labour', icon: Users },
    { id: 'other', label: 'Other', icon: DollarSign },
  ];

  // Worker form state for adding new workers
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    name: '', role: '', wage_type: 'daily', wage_amount: '', join_date: new Date().toISOString().split('T')[0], phone: ''
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Financial Records</h1>
        <p className="text-blue-100 mt-1">Manage all transactions by category</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Egg Revenue</span>
          </div>
          <p className="text-xl font-bold text-gray-800">₨{totalEggRevenue.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-amber-500">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Wheat className="w-4 h-4" />
            <span className="text-xs font-medium">Feed Cost</span>
          </div>
          <p className="text-xl font-bold text-gray-800">₨{totalFeedCost.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Bird className="w-4 h-4" />
            <span className="text-xs font-medium">Hatchery Cost</span>
          </div>
          <p className="text-xl font-bold text-gray-800">₨{totalHatcheryCost.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Labour Cost</span>
          </div>
          <p className="text-xl font-bold text-gray-800">₨{totalLabourCost.toLocaleString()}</p>
        </div>
        
        <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${netProfit >= 0 ? 'border-green-500' : 'border-red-500'}`}>
          <div className={`flex items-center gap-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'} mb-1`}>
            {netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-xs font-medium">Net Profit</span>
          </div>
          <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₨{netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Income</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-700">Egg Sales ({eggSales.length} transactions)</span>
                      <span className="font-semibold text-green-800">₨{totalEggRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="border-t border-green-200 mt-4 pt-4">
                    <div className="flex justify-between text-lg font-bold text-green-800">
                      <span>Total Income</span>
                      <span>₨{totalEggRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">Expenses</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-red-700">Feed Purchases ({feedPurchases.length})</span>
                      <span className="font-semibold text-red-800">₨{totalFeedCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">Bird Purchases ({flocks.length})</span>
                      <span className="font-semibold text-red-800">₨{totalHatcheryCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">Labour Payments ({labourPayments.length})</span>
                      <span className="font-semibold text-red-800">₨{totalLabourCost.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="border-t border-red-200 mt-4 pt-4">
                    <div className="flex justify-between text-lg font-bold text-red-800">
                      <span>Total Expenses</span>
                      <span>₨{(totalFeedCost + totalHatcheryCost + totalLabourCost).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xl font-semibold ${netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    Net {netProfit >= 0 ? 'Profit' : 'Loss'}
                  </span>
                  <span className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    ₨{Math.abs(netProfit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Egg Sales Tab */}
          {activeTab === 'eggs' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Egg Sales Records</h3>
                <button
                  onClick={() => openModal('egg')}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Sale
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="text-left p-3 text-green-800 font-semibold">Date</th>
                      <th className="text-left p-3 text-green-800 font-semibold">Buyer</th>
                      <th className="text-right p-3 text-green-800 font-semibold">Peti</th>
                      <th className="text-right p-3 text-green-800 font-semibold">₨/Peti</th>
                      <th className="text-right p-3 text-green-800 font-semibold">Total Eggs</th>
                      <th className="text-right p-3 text-green-800 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eggSales.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          <Egg className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          No egg sales recorded yet
                        </td>
                      </tr>
                    ) : (
                      eggSales.map((sale) => (
                        <tr key={sale.id} className="border-b hover:bg-green-50">
                          <td className="p-3">{new Date(sale.date).toLocaleDateString()}</td>
                          <td className="p-3 font-medium">{sale.buyer}</td>
                          <td className="p-3 text-right">{sale.peti}</td>
                          <td className="p-3 text-right">₨{sale.price_per_peti.toLocaleString()}</td>
                          <td className="p-3 text-right">{sale.total_eggs.toLocaleString()}</td>
                          <td className="p-3 text-right font-semibold text-green-600">₨{sale.total_amount.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {eggSales.length > 0 && (
                    <tfoot>
                      <tr className="bg-green-100">
                        <td colSpan={5} className="p-3 text-right font-semibold text-green-800">Total Revenue:</td>
                        <td className="p-3 text-right font-bold text-green-800">₨{totalEggRevenue.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Feed Tab */}
          {activeTab === 'feed' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Feed Purchase Records</h3>
                <button
                  onClick={() => openModal('feed')}
                  className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Purchase
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-amber-50">
                      <th className="text-left p-3 text-amber-800 font-semibold">Date</th>
                      <th className="text-left p-3 text-amber-800 font-semibold">Feed Type</th>
                      <th className="text-right p-3 text-amber-800 font-semibold">Bags</th>
                      <th className="text-right p-3 text-amber-800 font-semibold">₨/Bag</th>
                      <th className="text-right p-3 text-amber-800 font-semibold">Total KG</th>
                      <th className="text-right p-3 text-amber-800 font-semibold">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedPurchases.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          <Wheat className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          No feed purchases recorded yet
                        </td>
                      </tr>
                    ) : (
                      feedPurchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b hover:bg-amber-50">
                          <td className="p-3">{new Date(purchase.date).toLocaleDateString()}</td>
                          <td className="p-3 font-medium">{purchase.feed_type}</td>
                          <td className="p-3 text-right">{purchase.bags}</td>
                          <td className="p-3 text-right">₨{purchase.price_per_bag.toLocaleString()}</td>
                          <td className="p-3 text-right">{(purchase.bags * 50).toLocaleString()} kg</td>
                          <td className="p-3 text-right font-semibold text-red-600">₨{purchase.total_cost.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {feedPurchases.length > 0 && (
                    <tfoot>
                      <tr className="bg-amber-100">
                        <td colSpan={5} className="p-3 text-right font-semibold text-amber-800">Total Cost:</td>
                        <td className="p-3 text-right font-bold text-amber-800">₨{totalFeedCost.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Hatchery Tab */}
          {activeTab === 'hatchery' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Bird Purchase Records (Chairman Hatchery)</h3>
                <button
                  onClick={() => openModal('hatchery')}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Purchase
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="text-left p-3 text-purple-800 font-semibold">Date</th>
                      <th className="text-left p-3 text-purple-800 font-semibold">Breed</th>
                      <th className="text-right p-3 text-purple-800 font-semibold">Birds</th>
                      <th className="text-right p-3 text-purple-800 font-semibold">₨/Bird</th>
                      <th className="text-right p-3 text-purple-800 font-semibold">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flocks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          <Bird className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          No bird purchases recorded yet
                        </td>
                      </tr>
                    ) : (
                      flocks.map((flock) => (
                        <tr key={flock.id} className="border-b hover:bg-purple-50">
                          <td className="p-3">{new Date(flock.purchase_date).toLocaleDateString()}</td>
                          <td className="p-3 font-medium">{flock.breed}</td>
                          <td className="p-3 text-right">{flock.quantity}</td>
                          <td className="p-3 text-right">₨{Math.round(flock.purchase_price / flock.quantity).toLocaleString()}</td>
                          <td className="p-3 text-right font-semibold text-red-600">₨{flock.purchase_price.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {flocks.length > 0 && (
                    <tfoot>
                      <tr className="bg-purple-100">
                        <td colSpan={4} className="p-3 text-right font-semibold text-purple-800">Total Cost:</td>
                        <td className="p-3 text-right font-bold text-purple-800">₨{totalHatcheryCost.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Labour Tab */}
          {activeTab === 'labour' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Labour Payment Records</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowWorkerForm(true)}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Worker
                  </button>
                  <button
                    onClick={() => openModal('labour')}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Payment
                  </button>
                </div>
              </div>

              {/* Workers List */}
              {workers.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Registered Workers</h4>
                  <div className="flex flex-wrap gap-2">
                    {workers.map((worker) => (
                      <div key={worker.id} className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm">
                        <span className="font-medium text-orange-800">{worker.name}</span>
                        {worker.role && <span className="text-orange-600 ml-1">({worker.role})</span>}
                        <span className="text-orange-500 ml-2">₨{worker.wage_amount}/{worker.wage_type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-orange-50">
                      <th className="text-left p-3 text-orange-800 font-semibold">Date</th>
                      <th className="text-left p-3 text-orange-800 font-semibold">Worker</th>
                      <th className="text-left p-3 text-orange-800 font-semibold">Role</th>
                      <th className="text-left p-3 text-orange-800 font-semibold">Notes</th>
                      <th className="text-right p-3 text-orange-800 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labourPayments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          No labour payments recorded yet
                        </td>
                      </tr>
                    ) : (
                      labourPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-orange-50">
                          <td className="p-3">{new Date(payment.date).toLocaleDateString()}</td>
                          <td className="p-3 font-medium">{payment.worker_name}</td>
                          <td className="p-3 text-gray-600">{payment.worker_role || '-'}</td>
                          <td className="p-3 text-gray-600">{payment.notes || '-'}</td>
                          <td className="p-3 text-right font-semibold text-red-600">₨{payment.amount.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {labourPayments.length > 0 && (
                    <tfoot>
                      <tr className="bg-orange-100">
                        <td colSpan={4} className="p-3 text-right font-semibold text-orange-800">Total Paid:</td>
                        <td className="p-3 text-right font-bold text-orange-800">₨{totalLabourCost.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Other Tab */}
          {activeTab === 'other' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Other Transactions</h3>
                <button
                  onClick={() => openModal('other')}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 text-gray-800 font-semibold">Date</th>
                      <th className="text-left p-3 text-gray-800 font-semibold">Description</th>
                      <th className="text-center p-3 text-gray-800 font-semibold">Type</th>
                      <th className="text-right p-3 text-gray-800 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.filter(t => t.category === 'other').length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">
                          <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          No other transactions recorded yet
                        </td>
                      </tr>
                    ) : (
                      transactions.filter(t => t.category === 'other').map((txn) => (
                        <tr key={txn.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{new Date(txn.date).toLocaleDateString()}</td>
                          <td className="p-3 font-medium">{txn.description}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              txn.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {txn.type.toUpperCase()}
                            </span>
                          </td>
                          <td className={`p-3 text-right font-semibold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.type === 'credit' ? '+' : '-'}₨{txn.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Worker Modal */}
      {showWorkerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add New Worker</h3>
              <button onClick={() => setShowWorkerForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Worker Name *</label>
                <input
                  type="text"
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter worker name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={workerForm.role}
                  onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Caretaker, Cleaner"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wage Type</label>
                  <select
                    value={workerForm.wage_type}
                    onChange={(e) => setWorkerForm({ ...workerForm, wage_type: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wage Amount *</label>
                  <input
                    type="number"
                    value={workerForm.wage_amount}
                    onChange={(e) => setWorkerForm({ ...workerForm, wage_amount: e.target.value })}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="₨"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                <input
                  type="date"
                  value={workerForm.join_date}
                  onChange={(e) => setWorkerForm({ ...workerForm, join_date: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={workerForm.phone}
                  onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Phone number"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWorkerForm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (workerForm.name && workerForm.wage_amount) {
                    handleAddWorker({
                      name: workerForm.name,
                      role: workerForm.role,
                      wage_type: workerForm.wage_type,
                      wage_amount: parseFloat(workerForm.wage_amount),
                      join_date: workerForm.join_date,
                      phone: workerForm.phone
                    });
                    setWorkerForm({ name: '', role: '', wage_type: 'daily', wage_amount: '', join_date: new Date().toISOString().split('T')[0], phone: '' });
                    setShowWorkerForm(false);
                  }
                }}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
              >
                Add Worker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            {/* Egg Sale Form */}
            {modalType === 'egg' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Add Egg Sale</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
                  <strong>Auto Credit:</strong> This sale will automatically credit Chairman Group balance.
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name *</label>
                    <input
                      type="text"
                      value={eggForm.buyer}
                      onChange={(e) => setEggForm({ ...eggForm, buyer: e.target.value })}
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                      placeholder="Enter buyer name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Peti (360 eggs) *</label>
                      <input
                        type="number"
                        value={eggForm.peti}
                        onChange={(e) => setEggForm({ ...eggForm, peti: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                        placeholder="Qty"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price/Peti (₨) *</label>
                      <input
                        type="number"
                        value={eggForm.price}
                        onChange={(e) => setEggForm({ ...eggForm, price: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                        placeholder="₨"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={eggForm.date}
                        onChange={(e) => setEggForm({ ...eggForm, date: e.target.value })}
                        className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  {eggForm.peti && eggForm.price && (
                    <div className="bg-green-100 rounded-lg p-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total Eggs:</span>
                        <span>{(parseInt(eggForm.peti) * 360).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-green-700">
                        <span>Total Amount:</span>
                        <span>₨{(parseInt(eggForm.peti) * parseFloat(eggForm.price)).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border rounded-lg font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleAddEggSale} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                    Add Sale
                  </button>
                </div>
              </>
            )}

            {/* Feed Purchase Form */}
            {modalType === 'feed' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Add Feed Purchase</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-700">
                  <strong>Auto Debit:</strong> This purchase will automatically debit Chairman Group balance.
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feed Type *</label>
                    <select
                      value={feedForm.type}
                      onChange={(e) => setFeedForm({ ...feedForm, type: e.target.value })}
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Layer Feed">Layer Feed</option>
                      <option value="Grower Feed">Grower Feed</option>
                      <option value="Starter Feed">Starter Feed</option>
                      <option value="Pre-Lay Feed">Pre-Lay Feed</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bags (50kg each) *</label>
                      <input
                        type="number"
                        value={feedForm.bags}
                        onChange={(e) => setFeedForm({ ...feedForm, bags: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500"
                        placeholder="Qty"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price/Bag (₨) *</label>
                      <input
                        type="number"
                        value={feedForm.price}
                        onChange={(e) => setFeedForm({ ...feedForm, price: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500"
                        placeholder="₨"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={feedForm.date}
                        onChange={(e) => setFeedForm({ ...feedForm, date: e.target.value })}
                        className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  
                  {feedForm.bags && feedForm.price && (
                    <div className="bg-amber-100 rounded-lg p-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total Weight:</span>
                        <span>{(parseInt(feedForm.bags) * 50).toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-amber-700">
                        <span>Total Cost:</span>
                        <span>₨{(parseInt(feedForm.bags) * parseFloat(feedForm.price)).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border rounded-lg font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleAddFeedPurchase} className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">
                    Add Purchase
                  </button>
                </div>
              </>
            )}

            {/* Hatchery Form */}
            {modalType === 'hatchery' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Add Bird Purchase</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4 text-sm text-purple-700">
                  <strong>Auto Debit:</strong> This purchase will automatically debit Chairman Group balance.
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breed *</label>
                    <input
                      type="text"
                      value={hatcheryForm.breed}
                      onChange={(e) => setHatcheryForm({ ...hatcheryForm, breed: e.target.value })}
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Lohmann Brown, Hy-Line"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Birds *</label>
                      <input
                        type="number"
                        value={hatcheryForm.birds}
                        onChange={(e) => setHatcheryForm({ ...hatcheryForm, birds: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                        placeholder="Qty"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price/Bird (₨) *</label>
                      <input
                        type="number"
                        value={hatcheryForm.price}
                        onChange={(e) => setHatcheryForm({ ...hatcheryForm, price: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                        placeholder="₨"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={hatcheryForm.date}
                        onChange={(e) => setHatcheryForm({ ...hatcheryForm, date: e.target.value })}
                        className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <input
                      type="text"
                      value={hatcheryForm.notes}
                      onChange={(e) => setHatcheryForm({ ...hatcheryForm, notes: e.target.value })}
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                      placeholder="Additional notes"
                    />
                  </div>
                  
                  {hatcheryForm.birds && hatcheryForm.price && (
                    <div className="bg-purple-100 rounded-lg p-4">
                      <div className="flex justify-between text-lg font-bold text-purple-700">
                        <span>Total Cost:</span>
                        <span>₨{(parseInt(hatcheryForm.birds) * parseFloat(hatcheryForm.price)).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border rounded-lg font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleAddBirdPurchase} className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                    Add Purchase
                  </button>
                </div>
              </>
            )}

            {/* Labour Payment Form */}
            {modalType === 'labour' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Add Labour Payment</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-sm text-orange-700">
                  <strong>Auto Debit:</strong> This payment will automatically debit Chairman Group balance.
                </div>
                
                {workers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No workers registered yet.</p>
                    <p className="text-sm">Please add a worker first.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Worker *</label>
                      <select
                        value={labourForm.worker_id}
                        onChange={(e) => setLabourForm({ ...labourForm, worker_id: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Choose a worker</option>
                        {workers.map((worker) => (
                          <option key={worker.id} value={worker.id}>
                            {worker.name} {worker.role && `(${worker.role})`} - ₨{worker.wage_amount}/{worker.wage_type}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₨) *</label>
                      <input
                        type="number"
                        value={labourForm.amount}
                        onChange={(e) => setLabourForm({ ...labourForm, amount: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                        placeholder="Payment amount"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={labourForm.date}
                          onChange={(e) => setLabourForm({ ...labourForm, date: e.target.value })}
                          className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <input
                        type="text"
                        value={labourForm.notes}
                        onChange={(e) => setLabourForm({ ...labourForm, notes: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Weekly payment, Bonus"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border rounded-lg font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                  {workers.length > 0 && (
                    <button onClick={handleAddLabourPayment} className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">
                      Add Payment
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Other Transaction Form */}
            {modalType === 'other' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Add Other Transaction</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <input
                      type="text"
                      value={otherForm.description}
                      onChange={(e) => setOtherForm({ ...otherForm, description: e.target.value })}
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-500"
                      placeholder="e.g., Electricity Bill, Equipment"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₨) *</label>
                      <input
                        type="number"
                        value={otherForm.amount}
                        onChange={(e) => setOtherForm({ ...otherForm, amount: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-500"
                        placeholder="₨"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <select
                        value={otherForm.type}
                        onChange={(e) => setOtherForm({ ...otherForm, type: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="debit">Debit (Expense)</option>
                        <option value="credit">Credit (Income)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={otherForm.date}
                        onChange={(e) => setOtherForm({ ...otherForm, date: e.target.value })}
                        className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-gray-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border rounded-lg font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleAddOtherTransaction} className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800">
                    Add Transaction
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


