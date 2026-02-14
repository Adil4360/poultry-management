import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Plus, ShoppingCart, Package } from 'lucide-react';
import { format } from 'date-fns';

export function Eggs() {
  const { state, addEggProduction, addEggSale } = useApp();
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);

  const [production, setProduction] = useState({
    flockId: '',
    totalEggs: '',
    brokenEggs: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const [sale, setSale] = useState({
    petiCount: '',
    pricePerPeti: state.eggPrice.pricePerPeti.toString(),
    buyerName: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const handleAddProduction = async () => {
    if (!production.flockId || !production.totalEggs) return;
    
    const total = parseInt(production.totalEggs);
    const broken = parseInt(production.brokenEggs) || 0;
    
    await addEggProduction({
      flockId: production.flockId,
      date: production.date,
      totalEggs: total,
      brokenEggs: broken,
      goodEggs: total - broken
    });
    
    setProduction({
      flockId: '',
      totalEggs: '',
      brokenEggs: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setShowProductionModal(false);
  };

  const handleAddSale = async () => {
    if (!sale.petiCount || !sale.buyerName) return;
    
    const petiCount = parseInt(sale.petiCount);
    if (petiCount > state.eggInventory.totalPeti) {
      alert(`Not enough peti in stock. Available: ${state.eggInventory.totalPeti} Peti`);
      return;
    }
    
    await addEggSale({
      petiCount,
      pricePerPeti: parseInt(sale.pricePerPeti),
      buyerName: sale.buyerName,
      date: sale.date
    });
    
    setSale({
      petiCount: '',
      pricePerPeti: state.eggPrice.pricePerPeti.toString(),
      buyerName: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setShowSaleModal(false);
  };

  const activeFlocks = state.flocks.filter(f => f.isActive);
  
  // Recent productions
  const recentProductions = [...state.eggProductions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Recent sales
  const recentSales = [...state.eggSales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const totalEggsProduced = state.eggProductions.reduce((sum, p) => sum + p.totalEggs, 0);
  const totalBrokenEggs = state.eggProductions.reduce((sum, p) => sum + p.brokenEggs, 0);
  const totalPetiSold = state.eggSales.reduce((sum, s) => sum + s.petiCount, 0);
  const totalRevenue = state.eggSales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Egg Management</h1>
          <p className="text-gray-500">Track production and sales (1 Peti = 360 eggs)</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowProductionModal(true)}>
            <Plus className="w-5 h-5" />
            Record Production
          </Button>
          <Button variant="success" onClick={() => setShowSaleModal(true)}>
            <ShoppingCart className="w-5 h-5" />
            Record Sale
          </Button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Current Inventory</p>
              <p className="text-3xl font-bold">{state.eggInventory.totalPeti}</p>
              <p className="text-yellow-100 text-sm">Peti Available</p>
            </div>
            <Package className="w-12 h-12 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-500 text-sm">Remaining Eggs</p>
          <p className="text-2xl font-bold text-gray-800">{state.eggInventory.remainingEggs}</p>
          <p className="text-gray-400 text-xs">Need {360 - state.eggInventory.remainingEggs} more for 1 Peti</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-500 text-sm">Total Produced</p>
          <p className="text-2xl font-bold text-gray-800">{totalEggsProduced.toLocaleString()}</p>
          <p className="text-red-400 text-xs">Broken: {totalBrokenEggs}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-500 text-sm">Total Sales</p>
          <p className="text-2xl font-bold text-green-600">Rs. {totalRevenue.toLocaleString()}</p>
          <p className="text-gray-400 text-xs">{totalPetiSold} Peti sold</p>
        </div>
      </div>

      {/* Price Info */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-800 font-semibold">Current Egg Price</p>
            <p className="text-3xl font-bold text-green-600">Rs. {state.eggPrice.pricePerPeti}/Peti</p>
          </div>
          <div className="text-right text-green-700">
            <p className="text-sm">1 Peti = 360 Eggs</p>
            <p className="text-sm">Price per egg: Rs. {(state.eggPrice.pricePerPeti / 360).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production History */}
        <Card title="Recent Production">
          {recentProductions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No production records yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-auto">
              {recentProductions.map(prod => {
                const flock = state.flocks.find(f => f.id === prod.flockId);
                return (
                  <div key={prod.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{prod.date}</p>
                      <p className="text-sm text-gray-500">{flock?.breed || 'Unknown Flock'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{prod.goodEggs.toLocaleString()} eggs</p>
                      <p className="text-xs text-gray-500">
                        {prod.petiCount} peti + {prod.remainingEggs} eggs
                      </p>
                      {prod.brokenEggs > 0 && (
                        <p className="text-xs text-red-500">Broken: {prod.brokenEggs}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Sales History */}
        <Card title="Recent Sales">
          {recentSales.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales records yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-auto">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{sale.date}</p>
                    <p className="text-sm text-gray-500">{sale.buyerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Rs. {sale.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {sale.petiCount} peti @ Rs.{sale.pricePerPeti}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add Production Modal */}
      <Modal isOpen={showProductionModal} onClose={() => setShowProductionModal(false)} title="Record Egg Production">
        <div className="space-y-4">
          <Select
            label="Select Flock"
            value={production.flockId}
            onChange={(e) => setProduction({ ...production, flockId: e.target.value })}
            options={activeFlocks.map(f => ({ value: f.id, label: `${f.breed} (${f.numberOfLayers} layers)` }))}
          />
          <Input
            label="Date"
            type="date"
            value={production.date}
            onChange={(e) => setProduction({ ...production, date: e.target.value })}
          />
          <Input
            label="Total Eggs Collected"
            type="number"
            value={production.totalEggs}
            onChange={(e) => setProduction({ ...production, totalEggs: e.target.value })}
            placeholder="e.g., 4500"
          />
          <Input
            label="Broken/Damaged Eggs"
            type="number"
            value={production.brokenEggs}
            onChange={(e) => setProduction({ ...production, brokenEggs: e.target.value })}
            placeholder="e.g., 25"
          />
          
          {production.totalEggs && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Good Eggs: {parseInt(production.totalEggs) - (parseInt(production.brokenEggs) || 0)}
              </p>
              <p className="text-sm text-blue-800">
                With existing ({state.eggInventory.remainingEggs}): Will add {
                  Math.floor((state.eggInventory.remainingEggs + parseInt(production.totalEggs) - (parseInt(production.brokenEggs) || 0)) / 360)
                } Peti to inventory
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowProductionModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddProduction} className="flex-1">
              Record Production
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Sale Modal */}
      <Modal isOpen={showSaleModal} onClose={() => setShowSaleModal(false)} title="Record Egg Sale">
        <div className="space-y-4">
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-yellow-800 font-medium">Available: {state.eggInventory.totalPeti} Peti</p>
          </div>
          
          <Input
            label="Date"
            type="date"
            value={sale.date}
            onChange={(e) => setSale({ ...sale, date: e.target.value })}
          />
          <Input
            label="Number of Peti"
            type="number"
            value={sale.petiCount}
            onChange={(e) => setSale({ ...sale, petiCount: e.target.value })}
            placeholder="e.g., 10"
          />
          <Input
            label="Price per Peti (Rs.)"
            type="number"
            value={sale.pricePerPeti}
            onChange={(e) => setSale({ ...sale, pricePerPeti: e.target.value })}
          />
          <Input
            label="Buyer Name"
            value={sale.buyerName}
            onChange={(e) => setSale({ ...sale, buyerName: e.target.value })}
            placeholder="e.g., Ali Traders"
          />

          {sale.petiCount && sale.pricePerPeti && (
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-lg font-bold text-green-800">
                Total: Rs. {(parseInt(sale.petiCount) * parseInt(sale.pricePerPeti)).toLocaleString()}
              </p>
              <p className="text-sm text-green-600">
                {parseInt(sale.petiCount) * 360} eggs
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowSaleModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="success" onClick={handleAddSale} className="flex-1">
              Record Sale
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
