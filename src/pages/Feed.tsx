import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Warehouse, ShoppingBag, Utensils } from 'lucide-react';
import { format } from 'date-fns';

const FEED_TYPES = [
  { value: 'Layer Mash', label: 'Layer Mash' },
  { value: 'Layer Pellets', label: 'Layer Pellets' },
  { value: 'Pre-Starter', label: 'Pre-Starter' },
  { value: 'Starter', label: 'Starter' },
  { value: 'Grower', label: 'Grower' },
  { value: 'Developer', label: 'Developer' },
  { value: 'Other', label: 'Other' },
];

export function Feed() {
  const { state, purchaseFeed, consumeFeed } = useApp();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);

  const [purchase, setPurchase] = useState({
    feedType: '',
    bags: '',
    costPerBag: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const [consumption, setConsumption] = useState({
    feedType: '',
    bagsUsed: '',
    flockId: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const handlePurchase = async () => {
    if (!purchase.feedType || !purchase.bags || !purchase.costPerBag) return;
    
    await purchaseFeed({
      feedType: purchase.feedType,
      bags: parseInt(purchase.bags),
      costPerBag: parseInt(purchase.costPerBag),
      date: purchase.date
    });
    
    setPurchase({
      feedType: '',
      bags: '',
      costPerBag: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setShowPurchaseModal(false);
  };

  const handleConsumption = async () => {
    if (!consumption.feedType || !consumption.bagsUsed || !consumption.flockId) return;

    const stock = state.feedStocks.find(f => f.feedType === consumption.feedType);
    if (!stock || stock.bagsInStock < parseInt(consumption.bagsUsed)) {
      alert('Not enough feed in stock!');
      return;
    }
    
    await consumeFeed({
      feedType: consumption.feedType,
      bagsUsed: parseFloat(consumption.bagsUsed),
      flockId: consumption.flockId,
      date: consumption.date
    });
    
    setConsumption({
      feedType: '',
      bagsUsed: '',
      flockId: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setShowConsumptionModal(false);
  };

  const totalBags = state.feedStocks.reduce((sum, f) => sum + f.bagsInStock, 0);
  const totalFeedCost = state.feedPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalConsumed = state.feedConsumptions.reduce((sum, c) => sum + c.bagsUsed, 0);

  const activeFlocks = state.flocks.filter(f => f.isActive);

  const recentPurchases = [...state.feedPurchases]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const recentConsumptions = [...state.feedConsumptions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Feed Management</h1>
          <p className="text-gray-500 text-sm sm:text-base">Purchase from Chairman Feed - External Supplier (50kg bags)</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button onClick={() => setShowPurchaseModal(true)} className="flex-1 sm:flex-none text-sm sm:text-base">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Purchase</span> Feed
          </Button>
          <Button variant="secondary" onClick={() => setShowConsumptionModal(true)} className="flex-1 sm:flex-none text-sm sm:text-base">
            <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Record</span> Usage
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm">Total Stock</p>
              <p className="text-2xl sm:text-3xl font-bold">{totalBags}</p>
              <p className="text-purple-100 text-xs">Bags (50kg)</p>
            </div>
            <Warehouse className="w-8 h-8 sm:w-12 sm:h-12 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-gray-500 text-xs sm:text-sm">Total Feed Cost</p>
          <p className="text-lg sm:text-2xl font-bold text-red-600">Rs. {totalFeedCost.toLocaleString()}</p>
          <p className="text-gray-400 text-xs">All time</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-gray-500 text-xs sm:text-sm">Consumed</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">{totalConsumed.toFixed(1)}</p>
          <p className="text-gray-400 text-xs">Bags used</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-gray-500 text-xs sm:text-sm">Feed Types</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">{state.feedStocks.length}</p>
          <p className="text-gray-400 text-xs">In inventory</p>
        </div>
      </div>

      {/* External Supplier Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
        <p className="text-blue-800 font-semibold text-sm sm:text-base">External Supplier: Chairman Feed</p>
        <p className="text-blue-600 text-xs sm:text-sm">
          Feed purchases are paid from our farm account. If balance is insufficient, 
          the amount will be recorded as borrowed from Chairman Group (external entity).
        </p>
      </div>

      {/* Current Stock */}
      <Card title="Current Feed Stock">
        {state.feedStocks.length === 0 ? (
          <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">No feed in stock. Purchase from Chairman Feed!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {state.feedStocks.map(stock => (
              <div 
                key={stock.id} 
                className={`border rounded-xl p-3 sm:p-4 ${stock.bagsInStock < 10 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{stock.feedType}</h3>
                  {stock.bagsInStock < 10 && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Low</span>
                  )}
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">In Stock:</span>
                    <span className="font-bold text-base sm:text-lg">{stock.bagsInStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Weight:</span>
                    <span className="font-medium">{stock.bagsInStock * 50} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cost/Bag:</span>
                    <span className="font-medium">Rs. {stock.costPerBag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Recent Purchases">
          {recentPurchases.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm">No purchases yet</p>
          ) : (
            <div className="space-y-2 max-h-64 sm:max-h-80 overflow-auto">
              {recentPurchases.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm truncate">{p.feedType}</p>
                    <p className="text-xs text-gray-500">{p.date} • Chairman Feed</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold text-red-600 text-sm">Rs. {p.totalCost.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{p.bags} bags</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Recent Consumption">
          {recentConsumptions.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm">No consumption records yet</p>
          ) : (
            <div className="space-y-2 max-h-64 sm:max-h-80 overflow-auto">
              {recentConsumptions.map(c => {
                const flock = state.flocks.find(f => f.id === c.flockId);
                return (
                  <div key={c.id} className="flex items-center justify-between p-2 sm:p-3 bg-orange-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm truncate">{c.feedType}</p>
                      <p className="text-xs text-gray-500">{c.date} • {flock?.breed || 'Unknown'}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-orange-600 text-sm">{c.bagsUsed} bags</p>
                      <p className="text-xs text-gray-500">{c.bagsUsed * 50} kg</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Purchase Modal */}
      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Purchase Feed">
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>External Supplier:</strong> Chairman Feed<br />
              <strong>Your Balance:</strong> Rs. {state.bankAccount.balance.toLocaleString()}
            </p>
          </div>

          <Select
            label="Feed Type"
            value={purchase.feedType}
            onChange={(e) => setPurchase({ ...purchase, feedType: e.target.value })}
            options={FEED_TYPES}
          />
          <Input
            label="Date"
            type="date"
            value={purchase.date}
            onChange={(e) => setPurchase({ ...purchase, date: e.target.value })}
          />
          <Input
            label="Number of Bags (50kg each)"
            type="number"
            value={purchase.bags}
            onChange={(e) => setPurchase({ ...purchase, bags: e.target.value })}
            placeholder="e.g., 100"
          />
          <Input
            label="Cost per Bag (Rs.)"
            type="number"
            value={purchase.costPerBag}
            onChange={(e) => setPurchase({ ...purchase, costPerBag: e.target.value })}
            placeholder="e.g., 3500"
          />

          {purchase.bags && purchase.costPerBag && (
            <div className={`rounded-lg p-3 ${
              parseInt(purchase.bags) * parseInt(purchase.costPerBag) > state.bankAccount.balance 
                ? 'bg-red-50' 
                : 'bg-green-50'
            }`}>
              <p className="font-bold text-sm sm:text-base">Total: Rs. {(parseInt(purchase.bags) * parseInt(purchase.costPerBag)).toLocaleString()}</p>
              <p className="text-xs sm:text-sm">Total Weight: {parseInt(purchase.bags) * 50} kg</p>
              {parseInt(purchase.bags) * parseInt(purchase.costPerBag) > state.bankAccount.balance && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">
                  ⚠️ Will borrow Rs. {
                    (parseInt(purchase.bags) * parseInt(purchase.costPerBag) - state.bankAccount.balance).toLocaleString()
                  } from Chairman Group
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowPurchaseModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePurchase} className="flex-1">
              Purchase
            </Button>
          </div>
        </div>
      </Modal>

      {/* Consumption Modal */}
      <Modal isOpen={showConsumptionModal} onClose={() => setShowConsumptionModal(false)} title="Record Feed Usage">
        <div className="space-y-4">
          <Select
            label="Feed Type"
            value={consumption.feedType}
            onChange={(e) => setConsumption({ ...consumption, feedType: e.target.value })}
            options={state.feedStocks.map(f => ({ 
              value: f.feedType, 
              label: `${f.feedType} (${f.bagsInStock} bags)` 
            }))}
          />
          <Select
            label="For Flock"
            value={consumption.flockId}
            onChange={(e) => setConsumption({ ...consumption, flockId: e.target.value })}
            options={activeFlocks.map(f => ({ value: f.id, label: f.breed }))}
          />
          <Input
            label="Date"
            type="date"
            value={consumption.date}
            onChange={(e) => setConsumption({ ...consumption, date: e.target.value })}
          />
          <Input
            label="Bags Used"
            type="number"
            step="0.5"
            value={consumption.bagsUsed}
            onChange={(e) => setConsumption({ ...consumption, bagsUsed: e.target.value })}
            placeholder="e.g., 2.5"
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowConsumptionModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConsumption} className="flex-1">
              Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
