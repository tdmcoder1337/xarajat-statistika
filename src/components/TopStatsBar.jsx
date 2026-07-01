import { useState, useEffect } from 'react';
import { getDailySummary, getMonthlySummary } from '../services/api';

function StatCard({ label, value, type }) {
  const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('uz-UZ') + " so'm" : '—');
  return (
    <div className="top-stat-card">
      <div className="top-stat-label">{label}</div>
      <div className={`top-stat-value ${type}`}>{fmt(value)}</div>
    </div>
  );
}

export default function TopStatsBar() {
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();

  const [daily, setDaily] = useState({ income: 0, expense: 0, net: 0 });
  const [monthly, setMonthly] = useState({ income: 0, expense: 0 });

  const fetchStats = () => {
    getDailySummary(todayStr).then((r) => setDaily(r.data)).catch(() => {});
    getMonthlySummary(now.getMonth() + 1, now.getFullYear())
      .then((r) => setMonthly(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
    window.addEventListener('stats-refresh', fetchStats);
    return () => window.removeEventListener('stats-refresh', fetchStats);
  }, []);

  return (
    <div className="top-stats-bar">
      <StatCard label="Kunlik daromad" value={daily.income} type="income" />
      <StatCard label="Kunlik xarajat" value={daily.expense} type="expense" />
      <StatCard label="Oylik daromad" value={monthly.income} type="income" />
      <StatCard label="Oylik xarajat" value={monthly.expense} type="expense" />
    </div>
  );
}
