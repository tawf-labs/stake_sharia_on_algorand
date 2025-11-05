import React, { memo, useEffect, useState } from 'react';
import { Wallet, TrendingUp, Activity, ArrowUp, ArrowDown, Clock, ExternalLink } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{payload[0].payload.time}</p>
        <p className="text-white font-bold text-base">
          ${payload[0].value.toFixed(4)}
        </p>
      </div>
    );
  }
  return null;
};

const DashboardContent = memo(() => {
  const [priceData, setPriceData] = useState<{ time: string, price: number }[]>([]);
  const [isPositive, setIsPositive] = useState(true);
  const [priceChange, setPriceChange] = useState({ value: 0, percent: 0 });
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);

  const fetchAlgoPrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/algorand/market_chart?vs_currency=usd&days=30'
      );
      const data = await response.json();

      const formatted = data.prices.map((item: number[]) => ({
        time: new Date(item[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: item[1],
      }));

      setPriceData(formatted);

      const firstPrice = formatted[0].price;
      const lastPrice = formatted[formatted.length - 1].price;
      const change = lastPrice - firstPrice;
      const percentChange = ((change / firstPrice) * 100);

      setCurrentPrice(lastPrice);
      setPriceChange({ value: change, percent: percentChange });
      setIsPositive(change >= 0);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching ALGO price:', err);
      setLoading(false);
    }
  };

  const fetchAlgoTransactions = async () => {
    try {
      // Menggunakan Algorand Indexer API untuk mendapatkan transaksi terbaru
      const response = await fetch(
        'https://mainnet-idx.algonode.cloud/v2/transactions?limit=10'
      );
      const data = await response.json();

      const formattedTxns = data.transactions.slice(0, 10).map((tx: any) => ({
        id: tx.id,
        type: tx['tx-type'],
        amount: tx['payment-transaction']?.amount
          ? (tx['payment-transaction'].amount / 1000000).toFixed(2)
          : (tx['asset-transfer-transaction']?.amount || 0) / 1000000,
        time: new Date(tx['round-time'] * 1000).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        sender: tx.sender?.substring(0, 8) + '...',
        receiver: tx['payment-transaction']?.receiver?.substring(0, 8) + '...' || 'N/A'
      }));

      setTransactions(formattedTxns);

      // Calculate total staked and rewards from transactions
      const totalAmount = formattedTxns.reduce((sum: number, tx: any) =>
        sum + parseFloat(tx.amount || 0), 0
      );
      setTotalStaked(totalAmount * 0.7);
      setTotalRewards(totalAmount * 0.08);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  useEffect(() => {
    fetchAlgoPrice();
    fetchAlgoTransactions();

    // Auto refresh every 30 seconds
    const priceInterval = setInterval(fetchAlgoPrice, 30000);
    const txInterval = setInterval(fetchAlgoTransactions, 15000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(txInterval);
    };
  }, []);

  const chartColor = isPositive ? '#10b981' : '#ef4444';

  const getTransactionTypeColor = (type: string) => {
    switch(type) {
      case 'pay': return 'text-blue-400 bg-blue-500/10';
      case 'axfer': return 'text-purple-400 bg-purple-500/10';
      case 'acfg': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pt-28">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Your <span className="text-emerald-400">Algorand Dashboard</span>
          </h1>
          <p className="text-gray-400">
            Track your staking performance and Sharia-compliant investments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-xl hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-6 h-6 text-emerald-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wider">Staked</span>
            </div>
            <p className="text-3xl font-bold">{totalStaked.toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-1">ALGO</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-xl hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wider">Rewards</span>
            </div>
            <p className="text-3xl font-bold">{totalRewards.toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-1">ALGO Earned</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-xl hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-6 h-6 text-emerald-400" />
              <span className="text-xs text-gray-500 uppercase tracking-wider">Network</span>
            </div>
            <p className="text-3xl font-bold">{transactions.length}</p>
            <p className="text-gray-400 text-sm mt-1">Recent transactions</p>
          </div>
        </div>

        {/* Chart and Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">ALGO/USD</h2>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded">30D</span>
                </div>
                {loading ? (
                  <div className="h-8 w-32 bg-slate-800 animate-pulse rounded"></div>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-bold">
                      ${currentPrice.toFixed(4)}
                    </p>
                    <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      <span className="font-semibold">
                        {isPositive ? '+' : ''}{priceChange.percent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={priceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#475569"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#475569"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `$${value.toFixed(3)}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: '5 5' }} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={chartColor}
                    strokeWidth={2.5}
                    fill="url(#colorPrice)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Transaction History */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold">Transaction History</h2>
    <Clock className="w-5 h-5 text-emerald-400" />
  </div>

  {/* Scrollable container tanpa scrollbar */}
  <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-none">
    {transactions.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Loading transactions...</p>
      </div>
    ) : (
      transactions.map((tx, index) => (
        <div
          key={tx.id || index}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 hover:border-emerald-500/30 transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${getTransactionTypeColor(tx.type)}`}
            >
              {tx.type.toUpperCase()}
            </span>
            <span className="text-xs text-gray-400">{tx.time}</span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold">{tx.amount} ALGO</span>
            <a
              href={`https://algoexplorer.io/tx/${tx.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>From:</span>
              <span className="font-mono">{tx.sender}</span>
            </div>
            <div className="flex justify-between">
              <span>To:</span>
              <span className="font-mono">{tx.receiver}</span>
            </div>
          </div>
        </div>
      ))
    )}
  </div>

  <div className="mt-4 pt-4 border-t border-slate-700">
    <a
      href="https://algoexplorer.io/top-statistics"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-2"
    >
      View all on AlgoExplorer
      <ExternalLink className="w-4 h-4" />
    </a>
  </div>
</div>

        </div>
      </div>
    </div>
  );
});

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;
