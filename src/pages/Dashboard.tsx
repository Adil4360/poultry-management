import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { 
  Bird, 
  Egg, 
  DollarSign, 
  Warehouse, 
  AlertTriangle,
  Activity,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Syringe,
  Package
} from 'lucide-react';
import { format, parseISO, isAfter, startOfToday } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { state } = useApp();

  const totalLayers = state.flocks.filter(f => f.isActive).reduce((sum, f) => sum + f.numberOfLayers, 0);
  const totalMortality = state.flocks.reduce((sum, f) => sum + f.mortality, 0);
  
  const totalEggRevenue = state.eggSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalFeedCost = state.feedPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalMedicationCost = state.transactions
    .filter(t => t.category === 'medication')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const profitLoss = totalEggRevenue - totalFeedCost - totalMedicationCost;

  // Get last 7 days production data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return format(date, 'yyyy-MM-dd');
  });

  const productionData = last7Days.map(date => {
    const dayProduction = state.eggProductions
      .filter(p => p.date === date)
      .reduce((sum, p) => sum + p.goodEggs, 0);
    return {
      date: format(parseISO(date), 'MMM dd'),
      eggs: dayProduction
    };
  });

  // Upcoming vaccinations
  const upcomingVaccinations = state.vaccinations
    .filter(v => v.status === 'scheduled' && isAfter(parseISO(v.scheduledDate), startOfToday()))
    .slice(0, 5);

  // Feed stock alerts
  const lowFeedStock = state.feedStocks.filter(f => f.bagsInStock < 10);

  // Recent transactions
  const recentTransactions = [...state.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">Welcome back!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
          <Activity className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Farm Status: Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Layers"
          value={totalLayers.toLocaleString()}
          subtitle={`${state.flocks.filter(f => f.isActive).length} active flocks`}
          icon={<Bird className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Egg Inventory"
          value={`${state.eggInventory.totalPeti} Peti`}
          subtitle={`+${state.eggInventory.remainingEggs} loose eggs`}
          icon={<Egg className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          title="Bank Balance"
          value={`Rs. ${state.bankAccount.balance.toLocaleString()}`}
          subtitle={state.bankAccount.borrowedAmount > 0 ? `Borrowed: Rs. ${state.bankAccount.borrowedAmount.toLocaleString()}` : 'No outstanding debt'}
          icon={<DollarSign className="w-5 h-5" />}
          color={state.bankAccount.balance >= 0 ? "teal" : "red"}
        />
        <StatCard
          title="Feed Stock"
          value={`${state.feedStocks.reduce((sum, f) => sum + f.bagsInStock, 0)} Bags`}
          subtitle={`${state.feedStocks.length} feed types`}
          icon={<Warehouse className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Borrowed Amount Alert */}
      {state.bankAccount.borrowedAmount > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 sm:p-5 flex items-start gap-4 animate-fade-in shadow-sm">
          <div className="p-3 bg-red-100 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-red-800 text-base sm:text-lg">Borrowed Amount Outstanding</p>
            <p className="text-red-600 text-sm mt-1">
              You have Rs. {state.bankAccount.borrowedAmount.toLocaleString()} borrowed from Chairman Group (External Entity). Consider adding funds to clear this debt.
            </p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Egg Production" subtitle="Last 7 Days" icon={<Egg className="w-5 h-5" />}>
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData}>
                <defs>
                  <linearGradient id="eggGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: '10px 14px'
                  }}
                  formatter={(value) => [`${value} eggs`, 'Production']}
                />
                <Bar dataKey="eggs" fill="url(#eggGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Profit & Loss" subtitle="Financial Summary" icon={<DollarSign className="w-5 h-5" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-green-800 font-medium text-sm">Egg Sales Revenue</span>
              </div>
              <span className="font-bold text-green-700 text-sm sm:text-base">Rs. {totalEggRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-red-800 font-medium text-sm">Feed Costs</span>
              </div>
              <span className="font-bold text-red-700 text-sm sm:text-base">Rs. {totalFeedCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Syringe className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-amber-800 font-medium text-sm">Medication</span>
              </div>
              <span className="font-bold text-amber-700 text-sm sm:text-base">Rs. {totalMedicationCost.toLocaleString()}</span>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl ${profitLoss >= 0 ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-rose-600'} text-white shadow-lg`}>
              <span className="font-semibold">Net {profitLoss >= 0 ? 'Profit' : 'Loss'}</span>
              <span className="font-bold text-xl">Rs. {Math.abs(profitLoss).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Transactions */}
        <Card title="Recent Transactions" subtitle="Latest activity" className="lg:col-span-2" icon={<DollarSign className="w-5 h-5" />}>
          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <DollarSign className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              recentTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 cursor-default">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-lg ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {t.type === 'credit' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{t.source}</p>
                      <p className="text-xs text-gray-500">{t.date} • {t.linkedCompany}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm whitespace-nowrap ml-3 ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'credit' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Alerts & Upcoming */}
        <Card title="Alerts" subtitle="Needs attention" icon={<AlertTriangle className="w-5 h-5" />}>
          <div className="space-y-4">
            {lowFeedStock.length > 0 && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-red-500" />
                  <p className="text-sm font-semibold text-red-700">Low Feed Stock</p>
                </div>
                <div className="space-y-1">
                  {lowFeedStock.map(f => (
                    <p key={f.id} className="text-xs text-red-600">
                      • {f.feedType}: {f.bagsInStock} bags
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {upcomingVaccinations.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Syringe className="w-4 h-4 text-blue-500" />
                  <p className="text-sm font-semibold text-blue-700">Vaccinations Due</p>
                </div>
                <div className="space-y-1">
                  {upcomingVaccinations.map(v => (
                    <p key={v.id} className="text-xs text-blue-600">
                      • {v.vaccineName}: {v.scheduledDate}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {lowFeedStock.length === 0 && upcomingVaccinations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <Activity className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">All systems healthy!</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm font-medium">Egg Price</p>
              <p className="text-2xl sm:text-3xl font-bold">Rs. {state.eggPrice.pricePerPeti}</p>
              <p className="text-green-200 text-xs mt-1">per Peti (360 eggs)</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Egg className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-xs sm:text-sm font-medium">Total Mortality</p>
              <p className="text-2xl sm:text-3xl font-bold">{totalMortality}</p>
              <p className="text-rose-200 text-xs mt-1">birds across all flocks</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Bird className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-xs sm:text-sm font-medium">Loose Eggs</p>
              <p className="text-2xl sm:text-3xl font-bold">{state.eggInventory.remainingEggs}</p>
              <p className="text-violet-200 text-xs mt-1">Need {360 - state.eggInventory.remainingEggs} for 1 Peti</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
