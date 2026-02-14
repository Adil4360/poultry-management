import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export function Reports() {
  const { state, exportTransactionsCSV, exportEggSalesCSV, exportFeedPurchasesCSV } = useApp();

  // Calculate profit/loss
  const totalEggRevenue = state.eggSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalFeedCost = state.feedPurchases.reduce((sum, p) => sum + p.totalCost, 0);
  const totalMedicationCost = state.transactions
    .filter(t => t.category === 'medication')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalLaborCost = state.transactions
    .filter(t => t.category === 'labor')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalUtilitiesCost = state.transactions
    .filter(t => t.category === 'utilities')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOtherCost = state.transactions
    .filter(t => t.type === 'debit' && t.category === 'other')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = totalFeedCost + totalMedicationCost + totalLaborCost + totalUtilitiesCost + totalOtherCost;
  const netProfitLoss = totalEggRevenue - totalExpenses;

  // Expense breakdown for pie chart
  const expenseData = [
    { name: 'Feed', value: totalFeedCost, color: '#ef4444' },
    { name: 'Medication', value: totalMedicationCost, color: '#f97316' },
    { name: 'Labor', value: totalLaborCost, color: '#eab308' },
    { name: 'Utilities', value: totalUtilitiesCost, color: '#22c55e' },
    { name: 'Other', value: totalOtherCost, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  // Monthly production data
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const monthlyProductionData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const production = state.eggProductions
      .filter(p => {
        const date = parseISO(p.date);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, p) => sum + p.goodEggs, 0);
    
    const sales = state.eggSales
      .filter(s => {
        const date = parseISO(s.date);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, s) => sum + s.totalAmount, 0);

    return {
      month: format(month, 'MMM yyyy'),
      eggs: production,
      sales
    };
  });

  // Monthly P&L data
  const monthlyPLData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const revenue = state.eggSales
      .filter(s => {
        const date = parseISO(s.date);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, s) => sum + s.totalAmount, 0);
    
    const expenses = state.transactions
      .filter(t => {
        const date = parseISO(t.date);
        return date >= monthStart && date <= monthEnd && t.type === 'debit';
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: format(month, 'MMM'),
      revenue,
      expenses,
      profit: revenue - expenses
    };
  });

  // Feed purchase breakdown
  const feedPurchasesByType = state.feedPurchases.reduce((acc, p) => {
    if (!acc[p.feedType]) acc[p.feedType] = 0;
    acc[p.feedType] += p.totalCost;
    return acc;
  }, {} as Record<string, number>);

  const feedChartData = Object.entries(feedPurchasesByType).map(([name, value]) => ({
    name,
    value
  }));

  // Egg sales summary
  const totalPetiSold = state.eggSales.reduce((sum, s) => sum + s.petiCount, 0);
  const totalEggsSold = totalPetiSold * 360;
  const avgPricePerPeti = totalPetiSold > 0 ? totalEggRevenue / totalPetiSold : 0;

  // Production stats
  const totalEggsProduced = state.eggProductions.reduce((sum, p) => sum + p.totalEggs, 0);
  const totalBrokenEggs = state.eggProductions.reduce((sum, p) => sum + p.brokenEggs, 0);
  const brokenPercentage = totalEggsProduced > 0 ? ((totalBrokenEggs / totalEggsProduced) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm sm:text-base">Shafqat Poultry Farm - Performance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={exportTransactionsCSV} className="text-xs sm:text-sm">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            Transactions
          </Button>
          <Button size="sm" variant="secondary" onClick={exportEggSalesCSV} className="text-xs sm:text-sm">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            Egg Sales
          </Button>
          <Button size="sm" variant="secondary" onClick={exportFeedPurchasesCSV} className="text-xs sm:text-sm">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            Feed
          </Button>
        </div>
      </div>

      {/* Profit/Loss Summary */}
      <div className={`rounded-xl p-4 sm:p-6 ${netProfitLoss >= 0 ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-rose-600'} text-white`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <p className="text-white/80 text-xs sm:text-sm">Total Revenue</p>
            <p className="text-xl sm:text-3xl font-bold flex items-center justify-center gap-1 sm:gap-2">
              <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8" />
              Rs. {totalEggRevenue.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/80 text-xs sm:text-sm">Total Expenses</p>
            <p className="text-xl sm:text-3xl font-bold flex items-center justify-center gap-1 sm:gap-2">
              <TrendingDown className="w-5 h-5 sm:w-8 sm:h-8" />
              Rs. {totalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/80 text-xs sm:text-sm">Net {netProfitLoss >= 0 ? 'Profit' : 'Loss'}</p>
            <p className="text-2xl sm:text-4xl font-bold">
              Rs. {Math.abs(netProfitLoss).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-gray-500 text-xs sm:text-sm">Eggs Produced</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">{totalEggsProduced.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-gray-500 text-xs sm:text-sm">Peti Sold</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600">{totalPetiSold.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-gray-500 text-xs sm:text-sm">Avg Price/Peti</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600">Rs. {avgPricePerPeti.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-gray-500 text-xs sm:text-sm">Broken %</p>
          <p className="text-lg sm:text-2xl font-bold text-red-600">{brokenPercentage}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly P&L */}
        <Card title="Monthly Profit & Loss">
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPLData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card title="Expense Breakdown">
          <div className="h-48 sm:h-64">
            {expenseData.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">No expense data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Production Trends */}
      <Card title="Production & Sales Trends">
        <div className="h-56 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyProductionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line yAxisId="left" type="monotone" dataKey="eggs" stroke="#f59e0b" strokeWidth={2} name="Eggs Produced" />
              <Line yAxisId="right" type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} name="Sales (Rs.)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Sources */}
        <Card title="Revenue Summary">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded-lg">
              <span className="text-green-700 font-medium text-sm">Egg Sales Revenue</span>
              <span className="font-bold text-green-700 text-sm sm:text-base">Rs. {totalEggRevenue.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Peti Sold</span>
                <span className="font-medium">{totalPetiSold}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Eggs Sold</span>
                <span className="font-medium">{totalEggsSold.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Price/Peti</span>
                <span className="font-medium">Rs. {avgPricePerPeti.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card title="Expense Breakdown">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
              <span className="text-red-700">Feed (Chairman Feed)</span>
              <span className="font-bold text-red-700">Rs. {totalFeedCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
              <span className="text-orange-700">Medication</span>
              <span className="font-bold text-orange-700">Rs. {totalMedicationCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
              <span className="text-yellow-700">Labor</span>
              <span className="font-bold text-yellow-700">Rs. {totalLaborCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
              <span className="text-green-700">Utilities</span>
              <span className="font-bold text-green-700">Rs. {totalUtilitiesCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
              <span className="text-purple-700">Other</span>
              <span className="font-bold text-purple-700">Rs. {totalOtherCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg mt-4">
              <span className="font-bold text-gray-800">Total Expenses</span>
              <span className="font-bold text-gray-800">Rs. {totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Feed Purchase by Type */}
      {feedChartData.length > 0 && (
        <Card title="Feed Purchase by Type (from Chairman Feed)">
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => `Rs. ${Number(value).toLocaleString()}`} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Farm Account Statement */}
      <Card title="Shafqat Poultry Farm - Account Statement">
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Opening</p>
              <p className="font-bold">Rs. 0</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Credits</p>
              <p className="font-bold text-green-600">
                Rs. {state.transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Debits</p>
              <p className="font-bold text-red-600">
                Rs. {state.transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Balance</p>
              <p className={`font-bold ${state.bankAccount.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rs. {state.bankAccount.balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        {state.bankAccount.borrowedAmount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <p className="text-red-800 font-bold text-sm">Borrowed from Chairman Group: Rs. {state.bankAccount.borrowedAmount.toLocaleString()}</p>
            <p className="text-red-600 text-xs">This external debt needs to be repaid.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
