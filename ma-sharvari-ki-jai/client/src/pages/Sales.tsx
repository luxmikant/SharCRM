/**
 * SharCRM Sales Pipeline - Deal Tracking & Revenue Forecasting
 * @version 2.0.0
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { apiFetch } from '../api';
import { useAuth } from '../state/AuthContext';

interface PipelineStats {
  stages: Record<string, { count: number; value: number }>;
  summary: {
    totalDeals: number;
    wonDeals: number;
    lostDeals: number;
    openDeals: number;
    totalRevenue: number;
    winRate: number;
    avgDealSize: number;
    avgDaysToClose: number;
  };
  monthlyTrend: Array<{ period: string; won: number; lost: number; revenue: number }>;
}

interface Agent {
  _id: string;
  name: string;
  manager: string;
  regionalOffice: string;
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalRevenue: number;
  winRate: number;
  avgDealSize: number;
}

interface Product {
  _id: string;
  name: string;
  series: string;
  salesPrice: number;
  totalSold: number;
  totalRevenue: number;
  winRate: number;
}

interface Account {
  _id: string;
  name: string;
  sector: string;
  revenue: number;
  employees: number;
  officeLocation: string;
  totalDeals: number;
  wonDeals: number;
  lifetimeValue: number;
}

const stageColors: Record<string, string> = {
  Prospecting: 'bg-blue-500',
  Engaging: 'bg-yellow-500',
  Won: 'bg-green-500',
  Lost: 'bg-red-500'
};

const stageOrder = ['Prospecting', 'Engaging', 'Won', 'Lost'];

export default function Sales() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'leaderboard' | 'products' | 'accounts'>('pipeline');
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, teamRes, productsRes, accountsRes] = await Promise.all([
        apiFetch<PipelineStats>('/api/sales/pipeline/stats', {}, token),
        apiFetch<{ agents: Agent[] }>('/api/sales/team/leaderboard', {}, token),
        apiFetch<{ products: Product[] }>('/api/sales/products/analytics', {}, token),
        apiFetch<{ accounts: Account[] }>('/api/sales/accounts', {}, token)
      ]);
      setPipelineStats(statsRes);
      setAgents(teamRes.agents || []);
      setProducts(productsRes.products || []);
      setAccounts(accountsRes.accounts || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    try {
      await apiFetch('/api/sales/import', { 
        method: 'POST',
        body: JSON.stringify({ dataDir: 'E:/Xeno/data' })
      }, token);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to import data');
    } finally {
      setImporting(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Analytics</h1>
          <p className="text-gray-500">Pipeline overview and team performance</p>
        </div>
        <Button onClick={handleImport} disabled={importing}>
          {importing ? 'Importing...' : 'Import Data'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {(['pipeline', 'leaderboard', 'products', 'accounts'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab 
                ? 'bg-brand-500 text-gray-900' 
                : 'hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && pipelineStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(pipelineStats.summary.totalRevenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Win Rate</div>
                <div className="text-2xl font-bold">
                  {pipelineStats.summary.winRate}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Avg Deal Size</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(pipelineStats.summary.avgDealSize)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-gray-500">Avg Days to Close</div>
                <div className="text-2xl font-bold">
                  {pipelineStats.summary.avgDaysToClose} days
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Funnel */}
          <Card>
            <CardHeader title="Pipeline Funnel" />
            <CardContent>
              <div className="space-y-4">
                {stageOrder.map(stage => {
                  const stageData = pipelineStats.stages[stage] || { count: 0, value: 0 };
                  const maxCount = Math.max(...Object.values(pipelineStats.stages).map(s => s.count));
                  const percentage = maxCount > 0 ? (stageData.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={stage} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{stage}</span>
                        <span className="text-gray-500">
                          {stageData.count} deals • {formatCurrency(stageData.value)}
                        </span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: stageOrder.indexOf(stage) * 0.1 }}
                          className={`h-full ${stageColors[stage]} flex items-center justify-center text-white text-xs font-medium`}
                        >
                          {stageData.count > 0 && stageData.count}
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Deal Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {pipelineStats.summary.wonDeals}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Deals Won</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600">
                    {pipelineStats.summary.lostDeals}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Deals Lost</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {pipelineStats.summary.openDeals}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Open Deals</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader title="Sales Team Leaderboard" />
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Rank</th>
                      <th className="text-left py-3 px-4 font-medium">Agent</th>
                      <th className="text-left py-3 px-4 font-medium">Manager</th>
                      <th className="text-left py-3 px-4 font-medium">Region</th>
                      <th className="text-right py-3 px-4 font-medium">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium">Deals</th>
                      <th className="text-right py-3 px-4 font-medium">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.slice(0, 15).map((agent, idx) => (
                      <motion.tr
                        key={agent._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          {idx < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                              idx === 1 ? 'bg-gray-300 text-gray-700' :
                              'bg-amber-600 text-white'
                            }`}>
                              {idx + 1}
                            </span>
                          ) : (
                            <span className="text-gray-500">{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium">{agent.name}</td>
                        <td className="py-3 px-4 text-gray-500">{agent.manager}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{agent.regionalOffice}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(agent.totalRevenue)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-green-600">{agent.wonDeals}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-red-600">{agent.lostDeals}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={agent.winRate} className="w-16 h-2" />
                            <span className="text-sm">{agent.winRate?.toFixed(0)}%</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-semibold text-lg">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.series} Series</div>
                      </div>
                      <Badge>{formatCurrency(product.salesPrice)}</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Revenue</span>
                        <span className="font-medium">{formatCurrency(product.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Units Sold</span>
                        <span className="font-medium">{product.totalSold?.toLocaleString() || 0}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Win Rate</span>
                          <span className="font-medium">{product.winRate?.toFixed(0) || 0}%</span>
                        </div>
                        <Progress value={product.winRate || 0} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader title="Top Accounts" />
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Account</th>
                      <th className="text-left py-3 px-4 font-medium">Sector</th>
                      <th className="text-left py-3 px-4 font-medium">Location</th>
                      <th className="text-right py-3 px-4 font-medium">Employees</th>
                      <th className="text-right py-3 px-4 font-medium">Deals</th>
                      <th className="text-right py-3 px-4 font-medium">Lifetime Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.slice(0, 20).map((account, idx) => (
                      <motion.tr
                        key={account._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium">{account.name}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{account.sector}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {account.officeLocation}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {account.employees?.toLocaleString() || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-green-600">{account.wonDeals || 0}</span>
                          <span className="text-gray-400">/{account.totalDeals || 0}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(account.lifetimeValue || 0)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
