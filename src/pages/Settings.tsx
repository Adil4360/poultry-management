import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';

export function Settings() {
  const { state, updateEggPrice, setInitialBalance } = useApp();
  const [newPrice, setNewPrice] = useState(state.eggPrice.pricePerPeti.toString());
  const [balanceAmount, setBalanceAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState('');

  const handleUpdatePrice = async () => {
    if (!newPrice || parseInt(newPrice) <= 0) return;
    await updateEggPrice(parseInt(newPrice));
    setShowSuccess('price');
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const handleAddBalance = async () => {
    if (!balanceAmount || parseInt(balanceAmount) <= 0) return;
    await setInitialBalance(parseInt(balanceAmount));
    setBalanceAmount('');
    setShowSuccess('balance');
    setTimeout(() => setShowSuccess(''), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm sm:text-base">Configure system settings and prices</p>
      </div>

      {/* Success Messages */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
          <p className="text-green-800 text-sm sm:text-base">
            {showSuccess === 'price' && 'Egg price updated successfully!'}
            {showSuccess === 'balance' && 'Balance added successfully!'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Egg Price Settings */}
        <Card title="Egg Price Settings">
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-3 sm:p-4">
              <p className="text-green-800 text-xs sm:text-sm">Current Price</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">Rs. {state.eggPrice.pricePerPeti}/Peti</p>
              <p className="text-green-600 text-xs mt-1">
                Updated: {state.eggPrice.lastUpdated ? new Date(state.eggPrice.lastUpdated).toLocaleDateString() : 'Never'}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-blue-700">
              <p><strong>1 Peti = 360 Eggs</strong></p>
              <p>Price per egg: Rs. {(state.eggPrice.pricePerPeti / 360).toFixed(2)}</p>
            </div>

            <Input
              label="New Price per Peti (Rs.)"
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="e.g., 2500"
            />

            {newPrice && parseInt(newPrice) > 0 && (
              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">
                <p>New price per egg: Rs. {(parseInt(newPrice) / 360).toFixed(2)}</p>
              </div>
            )}

            <Button onClick={handleUpdatePrice} className="w-full">
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              Update Price
            </Button>
          </div>
        </Card>

        {/* Bank Balance Settings */}
        <Card title="Bank Account Settings">
          <div className="space-y-4">
            <div className={`rounded-lg p-3 sm:p-4 ${state.bankAccount.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-xs sm:text-sm ${state.bankAccount.balance >= 0 ? 'text-green-800' : 'text-red-800'}`}>Current Balance</p>
              <p className={`text-2xl sm:text-3xl font-bold ${state.bankAccount.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rs. {state.bankAccount.balance.toLocaleString()}
              </p>
            </div>

            {state.bankAccount.borrowedAmount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm">Borrowed from Chairman Group: Rs. {state.bankAccount.borrowedAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <Input
              label="Add Balance (Rs.)"
              type="number"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              placeholder="e.g., 100000"
            />

            <Button onClick={handleAddBalance} className="w-full">
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Balance
            </Button>
          </div>
        </Card>
      </div>

      {/* External Partners Information */}
      <Card title="External Partners & Suppliers">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-3 sm:p-4 text-white">
            <h3 className="text-lg sm:text-xl font-bold">Shafqat Poultry Farm</h3>
            <p className="text-green-100 text-sm">Our Farm - Layers Management</p>
          </div>

          <p className="text-gray-600 text-xs sm:text-sm bg-yellow-50 p-3 rounded-lg">
            <strong>Note:</strong> The following are EXTERNAL entities/suppliers that we transact with. 
            They are NOT part of our farm.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="border border-blue-200 bg-blue-50 rounded-xl p-3 sm:p-4">
              <h4 className="font-bold text-blue-800 text-sm sm:text-base">Chairman Group</h4>
              <p className="text-blue-600 text-xs sm:text-sm">External Finance Partner</p>
              <p className="text-blue-500 text-xs mt-2">Provides credit/loans when needed</p>
            </div>
            <div className="border border-purple-200 bg-purple-50 rounded-xl p-3 sm:p-4">
              <h4 className="font-bold text-purple-800 text-sm sm:text-base">Chairman Feed</h4>
              <p className="text-purple-600 text-xs sm:text-sm">External Supplier</p>
              <p className="text-purple-500 text-xs mt-2">Supplies feed (50kg bags)</p>
            </div>
            <div className="border border-orange-200 bg-orange-50 rounded-xl p-3 sm:p-4">
              <h4 className="font-bold text-orange-800 text-sm sm:text-base">Chairman Hatchery</h4>
              <p className="text-orange-600 text-xs sm:text-sm">External Supplier</p>
              <p className="text-orange-500 text-xs mt-2">Supplies chicks for new flocks</p>
            </div>
          </div>
        </div>
      </Card>

      {/* System Info */}
      <Card title="System Information">
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg text-sm">
            <span className="text-gray-600">Total Transactions</span>
            <span className="font-bold">{state.transactions.length}</span>
          </div>
          <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg text-sm">
            <span className="text-gray-600">Total Flocks</span>
            <span className="font-bold">{state.flocks.length}</span>
          </div>
          <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg text-sm">
            <span className="text-gray-600">Production Records</span>
            <span className="font-bold">{state.eggProductions.length}</span>
          </div>
          <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg text-sm">
            <span className="text-gray-600">Total Sales</span>
            <span className="font-bold">{state.eggSales.length}</span>
          </div>
          <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg text-sm">
            <span className="text-gray-600">Data Storage</span>
            <span className="font-bold text-green-600">IndexedDB (Local)</span>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card title="Quick Guide">
        <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-600">
          <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-2">🥚 Egg Pricing</h4>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li>Eggs sold by Peti (1 Peti = 360 eggs)</li>
              <li>Set price per Peti in settings</li>
              <li>Sales auto-calculate total</li>
            </ul>
          </div>

          <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">💰 Financial Rules</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Your farm has its own bank account</li>
              <li>Feed purchases debit automatically</li>
              <li>If balance insufficient, borrow from Chairman Group</li>
              <li>Egg sales credit to your account</li>
            </ul>
          </div>

          <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
            <h4 className="font-bold text-purple-800 mb-2">🌾 Feed Management</h4>
            <ul className="list-disc list-inside space-y-1 text-purple-700">
              <li>Feed bags = 50kg each</li>
              <li>Purchase from Chairman Feed (external)</li>
              <li>Track daily consumption per flock</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
