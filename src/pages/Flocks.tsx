import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Plus, Bird, Skull, Archive } from 'lucide-react';
import { format, differenceInWeeks, parseISO } from 'date-fns';

export function Flocks() {
  const { state, addFlock, updateFlock, recordMortality } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMortalityModal, setShowMortalityModal] = useState(false);
  const [selectedFlockId, setSelectedFlockId] = useState<string | null>(null);
  
  const [newFlock, setNewFlock] = useState({
    breed: '',
    numberOfLayers: '',
    ageWeeks: '',
    startDate: format(new Date(), 'yyyy-MM-dd')
  });

  const [mortalityCount, setMortalityCount] = useState('');

  const handleAddFlock = async () => {
    if (!newFlock.breed || !newFlock.numberOfLayers || !newFlock.ageWeeks) return;
    
    await addFlock({
      breed: newFlock.breed,
      numberOfLayers: parseInt(newFlock.numberOfLayers),
      ageWeeks: parseInt(newFlock.ageWeeks),
      startDate: newFlock.startDate,
      mortality: 0,
      isActive: true
    });
    
    setNewFlock({
      breed: '',
      numberOfLayers: '',
      ageWeeks: '',
      startDate: format(new Date(), 'yyyy-MM-dd')
    });
    setShowAddModal(false);
  };

  const handleRecordMortality = async () => {
    if (!selectedFlockId || !mortalityCount) return;
    
    await recordMortality(selectedFlockId, parseInt(mortalityCount));
    setMortalityCount('');
    setSelectedFlockId(null);
    setShowMortalityModal(false);
  };

  const openMortalityModal = (flockId: string) => {
    setSelectedFlockId(flockId);
    setShowMortalityModal(true);
  };

  const toggleFlockStatus = async (flockId: string, isActive: boolean) => {
    await updateFlock(flockId, { isActive: !isActive });
  };

  const calculateCurrentAge = (startDate: string, initialAge: number) => {
    const weeks = differenceInWeeks(new Date(), parseISO(startDate));
    return initialAge + weeks;
  };

  const activeFlocks = state.flocks.filter(f => f.isActive);
  const inactiveFlocks = state.flocks.filter(f => !f.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Flock Management</h1>
          <p className="text-gray-500">Manage your layer flocks</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5" />
          Add Flock
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-green-600 text-sm">Active Flocks</p>
          <p className="text-2xl font-bold text-green-800">{activeFlocks.length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-blue-600 text-sm">Total Layers</p>
          <p className="text-2xl font-bold text-blue-800">
            {activeFlocks.reduce((sum, f) => sum + f.numberOfLayers, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-red-600 text-sm">Total Mortality</p>
          <p className="text-2xl font-bold text-red-800">
            {state.flocks.reduce((sum, f) => sum + f.mortality, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4">
          <p className="text-yellow-600 text-sm">Inactive Flocks</p>
          <p className="text-2xl font-bold text-yellow-800">{inactiveFlocks.length}</p>
        </div>
      </div>

      {/* Active Flocks */}
      <Card title="Active Flocks">
        {activeFlocks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active flocks. Add your first flock!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeFlocks.map(flock => (
              <div key={flock.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Bird className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{flock.breed}</h3>
                      <p className="text-xs text-gray-500">Started: {flock.startDate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current Layers:</span>
                    <span className="font-medium">{flock.numberOfLayers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current Age:</span>
                    <span className="font-medium">{calculateCurrentAge(flock.startDate, flock.ageWeeks)} weeks</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mortality:</span>
                    <span className="font-medium text-red-600">{flock.mortality}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="danger"
                    onClick={() => openMortalityModal(flock.id)}
                    className="flex-1"
                  >
                    <Skull className="w-4 h-4" />
                    Mortality
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => toggleFlockStatus(flock.id, flock.isActive)}
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Inactive Flocks */}
      {inactiveFlocks.length > 0 && (
        <Card title="Inactive Flocks">
          <div className="space-y-2">
            {inactiveFlocks.map(flock => (
              <div key={flock.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-600">{flock.breed}</p>
                  <p className="text-sm text-gray-400">
                    {flock.numberOfLayers} layers • Mortality: {flock.mortality}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => toggleFlockStatus(flock.id, flock.isActive)}
                >
                  Reactivate
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Flock Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Flock">
        <div className="space-y-4">
          <Input
            label="Breed Name"
            value={newFlock.breed}
            onChange={(e) => setNewFlock({ ...newFlock, breed: e.target.value })}
            placeholder="e.g., Lohmann Brown, Hy-Line"
          />
          <Input
            label="Number of Layers"
            type="number"
            value={newFlock.numberOfLayers}
            onChange={(e) => setNewFlock({ ...newFlock, numberOfLayers: e.target.value })}
            placeholder="e.g., 5000"
          />
          <Input
            label="Age (weeks)"
            type="number"
            value={newFlock.ageWeeks}
            onChange={(e) => setNewFlock({ ...newFlock, ageWeeks: e.target.value })}
            placeholder="e.g., 18"
          />
          <Input
            label="Start Date"
            type="date"
            value={newFlock.startDate}
            onChange={(e) => setNewFlock({ ...newFlock, startDate: e.target.value })}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddFlock} className="flex-1">
              Add Flock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mortality Modal */}
      <Modal isOpen={showMortalityModal} onClose={() => setShowMortalityModal(false)} title="Record Mortality">
        <div className="space-y-4">
          <p className="text-gray-600">
            Record the number of birds that died.
          </p>
          <Input
            label="Number of Deaths"
            type="number"
            value={mortalityCount}
            onChange={(e) => setMortalityCount(e.target.value)}
            placeholder="e.g., 5"
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowMortalityModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRecordMortality} className="flex-1">
              Record Mortality
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
