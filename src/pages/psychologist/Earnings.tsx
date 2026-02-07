import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  CreditCard,
  Clock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointments } from '@/lib/firestore';

interface Transaction {
  id: string;
  patientName: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  type: 'session' | 'package';
}

export default function Earnings() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earningsData, setEarningsData] = useState<{ name: string; earnings: number }[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    pendingPayouts: 0,
    avgPerSession: 0
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const appointments = await getAppointments(user.uid, 'psychologist');
        
        // Calculate Stats
        const completed = appointments.filter(a => a.status === 'completed');
        const total = completed.reduce((sum, a) => sum + (a.price || 0), 0);
        
        const now = new Date();
        const thisMonthTotal = completed
            .filter(a => {
                const d = new Date(a.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((sum, a) => sum + (a.price || 0), 0);

        // Chart Data (Last 6 Months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthIdx = d.getMonth();
            const year = d.getFullYear();
            const monthEarnings = completed
                .filter(a => {
                    const ad = new Date(a.date);
                    return ad.getMonth() === monthIdx && ad.getFullYear() === year;
                })
                .reduce((sum, a) => sum + (a.price || 0), 0);
            chartData.push({ name: months[monthIdx], earnings: monthEarnings });
        }
        setEarningsData(chartData);

        // Transactions List
        const txList = appointments.map(a => ({
            id: a.id || '',
            patientName: a.studentName,
            date: new Date(a.date).toLocaleDateString(),
            amount: a.price || 0,
            status: a.status === 'cancelled' ? 'refunded' : (a.status === 'confirmed' ? 'pending' : 'completed'), // Simplified mapping
            type: 'session'
        } as Transaction));
        setTransactions(txList);

        setStats({
            totalEarnings: total,
            thisMonth: thisMonthTotal,
            pendingPayouts: 0, // Mock for now
            avgPerSession: completed.length ? Math.round(total / completed.length) : 0
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500 mt-1">Track your income and payouts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors">
            <CreditCard className="w-4 h-4" />
            Withdraw
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              +12%
            </span>
          </div>
          <p className="text-white/80 text-sm mb-1">Total Earnings</p>
          <p className="text-3xl font-bold">${stats.totalEarnings.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3" />
              +8%
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-1">This Month</p>
          <p className="text-2xl font-bold text-gray-900">${stats.thisMonth.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Pending Payouts</p>
          <p className="text-2xl font-bold text-gray-900">${stats.pendingPayouts}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Avg. Per Session</p>
          <p className="text-2xl font-bold text-gray-900">${stats.avgPerSession}</p>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Earnings Overview</h2>
          <div className="flex items-center gap-2">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  period === p
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                formatter={(value) => [`$${value}`, 'Earnings']}
              />
              <Area type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {tx.patientName.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{tx.patientName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <span className="capitalize text-gray-600">{tx.type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                      tx.status === 'completed' ? 'bg-green-50 text-green-700' :
                      tx.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`font-semibold ${tx.status === 'refunded' ? 'text-red-600' : 'text-gray-900'}`}>
                      {tx.status === 'refunded' ? '-' : '+'}${tx.amount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
