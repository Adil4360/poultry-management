import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Syringe, Bug, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { format, parseISO, isBefore, startOfToday } from 'date-fns';

export function Health() {
  const { state, addVaccination, updateVaccination, addDiseaseRecord, updateDiseaseRecord } = useApp();
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);

  const [vaccination, setVaccination] = useState({
    flockId: '',
    vaccineName: '',
    scheduledDate: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  const [disease, setDisease] = useState({
    flockId: '',
    diseaseName: '',
    dateDetected: format(new Date(), 'yyyy-MM-dd'),
    affectedBirds: '',
    treatmentCost: '',
    treatment: ''
  });

  const handleAddVaccination = async () => {
    if (!vaccination.flockId || !vaccination.vaccineName || !vaccination.scheduledDate) return;
    
    await addVaccination({
      flockId: vaccination.flockId,
      vaccineName: vaccination.vaccineName,
      scheduledDate: vaccination.scheduledDate,
      administeredDate: null,
      status: 'scheduled',
      notes: vaccination.notes
    });
    
    setVaccination({
      flockId: '',
      vaccineName: '',
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      notes: ''
    });
    setShowVaccinationModal(false);
  };

  const handleMarkVaccinationComplete = async (vaccinationId: string) => {
    await updateVaccination(vaccinationId, {
      status: 'completed',
      administeredDate: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const handleAddDisease = async () => {
    if (!disease.flockId || !disease.diseaseName) return;
    
    await addDiseaseRecord({
      flockId: disease.flockId,
      diseaseName: disease.diseaseName,
      dateDetected: disease.dateDetected,
      affectedBirds: parseInt(disease.affectedBirds) || 0,
      treatmentCost: parseInt(disease.treatmentCost) || 0,
      treatment: disease.treatment,
      status: 'active'
    });
    
    setDisease({
      flockId: '',
      diseaseName: '',
      dateDetected: format(new Date(), 'yyyy-MM-dd'),
      affectedBirds: '',
      treatmentCost: '',
      treatment: ''
    });
    setShowDiseaseModal(false);
  };

  const handleResolveDiseaseRecord = async (recordId: string) => {
    await updateDiseaseRecord(recordId, { status: 'resolved' });
  };

  const activeFlocks = state.flocks.filter(f => f.isActive);

  // Update overdue vaccinations
  const vaccinations = state.vaccinations.map(v => {
    if (v.status === 'scheduled' && isBefore(parseISO(v.scheduledDate), startOfToday())) {
      return { ...v, status: 'overdue' as const };
    }
    return v;
  });

  const scheduledVaccinations = vaccinations.filter(v => v.status === 'scheduled');
  const overdueVaccinations = vaccinations.filter(v => v.status === 'overdue');
  const completedVaccinations = vaccinations.filter(v => v.status === 'completed');

  const activeDiseases = state.diseaseRecords.filter(d => d.status === 'active');
  const resolvedDiseases = state.diseaseRecords.filter(d => d.status === 'resolved');

  const totalTreatmentCost = state.diseaseRecords.reduce((sum, d) => sum + d.treatmentCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Health Management</h1>
          <p className="text-gray-500">Vaccinations and disease tracking</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowVaccinationModal(true)}>
            <Syringe className="w-5 h-5" />
            Schedule Vaccination
          </Button>
          <Button variant="danger" onClick={() => setShowDiseaseModal(true)}>
            <Bug className="w-5 h-5" />
            Report Disease
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-yellow-800 text-sm">Scheduled</p>
              <p className="text-2xl font-bold text-yellow-600">{scheduledVaccinations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-red-800 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueVaccinations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-green-800 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedVaccinations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <Bug className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-purple-800 text-sm">Treatment Costs</p>
              <p className="text-xl font-bold text-purple-600">Rs. {totalTreatmentCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {(overdueVaccinations.length > 0 || activeDiseases.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-bold text-red-800 mb-3">⚠️ Attention Required</h3>
          {overdueVaccinations.length > 0 && (
            <div className="mb-2">
              <p className="text-red-700 font-medium">Overdue Vaccinations:</p>
              <ul className="list-disc list-inside text-red-600 text-sm">
                {overdueVaccinations.map(v => {
                  const flock = state.flocks.find(f => f.id === v.flockId);
                  return (
                    <li key={v.id}>{v.vaccineName} for {flock?.breed || 'Unknown'} (Due: {v.scheduledDate})</li>
                  );
                })}
              </ul>
            </div>
          )}
          {activeDiseases.length > 0 && (
            <div>
              <p className="text-red-700 font-medium">Active Diseases:</p>
              <ul className="list-disc list-inside text-red-600 text-sm">
                {activeDiseases.map(d => {
                  const flock = state.flocks.find(f => f.id === d.flockId);
                  return (
                    <li key={d.id}>{d.diseaseName} - {d.affectedBirds} birds ({flock?.breed || 'Unknown'})</li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Vaccination Schedule */}
      <Card title="Vaccination Schedule">
        {vaccinations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No vaccinations scheduled</p>
        ) : (
          <div className="space-y-2">
            {[...overdueVaccinations, ...scheduledVaccinations, ...completedVaccinations].map(v => {
              const flock = state.flocks.find(f => f.id === v.flockId);
              const statusColors = {
                scheduled: 'bg-yellow-50 border-yellow-200',
                overdue: 'bg-red-50 border-red-200',
                completed: 'bg-green-50 border-green-200'
              };
              const statusBadges = {
                scheduled: 'bg-yellow-100 text-yellow-700',
                overdue: 'bg-red-100 text-red-700',
                completed: 'bg-green-100 text-green-700'
              };

              return (
                <div key={v.id} className={`flex items-center justify-between p-3 rounded-lg border ${statusColors[v.status]}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{v.vaccineName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusBadges[v.status]}`}>
                        {v.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {flock?.breed || 'Unknown'} • Scheduled: {v.scheduledDate}
                      {v.administeredDate && ` • Administered: ${v.administeredDate}`}
                    </p>
                    {v.notes && <p className="text-sm text-gray-400">{v.notes}</p>}
                  </div>
                  {v.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      variant="success"
                      onClick={() => handleMarkVaccinationComplete(v.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Disease Records */}
      <Card title="Disease Records">
        {state.diseaseRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No disease records</p>
        ) : (
          <div className="space-y-2">
            {[...activeDiseases, ...resolvedDiseases].map(d => {
              const flock = state.flocks.find(f => f.id === d.flockId);
              return (
                <div 
                  key={d.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    d.status === 'active' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{d.diseaseName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        d.status === 'active' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {flock?.breed || 'Unknown'} • {d.affectedBirds} birds affected • {d.dateDetected}
                    </p>
                    <p className="text-sm text-gray-400">Treatment: {d.treatment || 'N/A'}</p>
                    {d.treatmentCost > 0 && (
                      <p className="text-sm text-red-500">Cost: Rs. {d.treatmentCost.toLocaleString()}</p>
                    )}
                  </div>
                  {d.status === 'active' && (
                    <Button 
                      size="sm" 
                      variant="success"
                      onClick={() => handleResolveDiseaseRecord(d.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolve
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Vaccination Modal */}
      <Modal isOpen={showVaccinationModal} onClose={() => setShowVaccinationModal(false)} title="Schedule Vaccination">
        <div className="space-y-4">
          <Select
            label="Select Flock"
            value={vaccination.flockId}
            onChange={(e) => setVaccination({ ...vaccination, flockId: e.target.value })}
            options={activeFlocks.map(f => ({ value: f.id, label: f.breed }))}
          />
          <Input
            label="Vaccine Name"
            value={vaccination.vaccineName}
            onChange={(e) => setVaccination({ ...vaccination, vaccineName: e.target.value })}
            placeholder="e.g., Newcastle Disease, IB, Marek's"
          />
          <Input
            label="Scheduled Date"
            type="date"
            value={vaccination.scheduledDate}
            onChange={(e) => setVaccination({ ...vaccination, scheduledDate: e.target.value })}
          />
          <Input
            label="Notes (optional)"
            value={vaccination.notes}
            onChange={(e) => setVaccination({ ...vaccination, notes: e.target.value })}
            placeholder="Any additional notes..."
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowVaccinationModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddVaccination} className="flex-1">
              Schedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Disease Modal */}
      <Modal isOpen={showDiseaseModal} onClose={() => setShowDiseaseModal(false)} title="Report Disease">
        <div className="space-y-4">
          <Select
            label="Select Flock"
            value={disease.flockId}
            onChange={(e) => setDisease({ ...disease, flockId: e.target.value })}
            options={activeFlocks.map(f => ({ value: f.id, label: f.breed }))}
          />
          <Input
            label="Disease Name"
            value={disease.diseaseName}
            onChange={(e) => setDisease({ ...disease, diseaseName: e.target.value })}
            placeholder="e.g., Fowl Pox, Coccidiosis"
          />
          <Input
            label="Date Detected"
            type="date"
            value={disease.dateDetected}
            onChange={(e) => setDisease({ ...disease, dateDetected: e.target.value })}
          />
          <Input
            label="Number of Affected Birds"
            type="number"
            value={disease.affectedBirds}
            onChange={(e) => setDisease({ ...disease, affectedBirds: e.target.value })}
            placeholder="e.g., 50"
          />
          <Input
            label="Treatment Cost (Rs.)"
            type="number"
            value={disease.treatmentCost}
            onChange={(e) => setDisease({ ...disease, treatmentCost: e.target.value })}
            placeholder="e.g., 5000"
          />
          <Input
            label="Treatment Description"
            value={disease.treatment}
            onChange={(e) => setDisease({ ...disease, treatment: e.target.value })}
            placeholder="e.g., Antibiotics and vitamins"
          />

          {disease.treatmentCost && parseInt(disease.treatmentCost) > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-red-700 text-sm">
                Rs. {parseInt(disease.treatmentCost).toLocaleString()} will be deducted from Chairman Group account
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowDiseaseModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleAddDisease} className="flex-1">
              Report Disease
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
