import { useState, useEffect, useRef } from 'react';
import { getDailySummary, getMonthlySummary } from '../services/api';
import { useRefresh } from '../context/RefreshContext';

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
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [daily, setDaily] = useState({ income: 0, expense: 0, net: 0 });
  const [monthly, setMonthly] = useState({ income: 0, expense: 0 });
  const { key, lastChange } = useRefresh();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Optimistic update: darhol local stateni yangilaymiz
    if (!isFirstLoad.current && lastChange) {
      const { action, type, amount, date, old: oldTx } = lastChange;

      setDaily((d) => {
        let { income, expense, net } = d;
        if (action === 'add' && date === todayStr) {
          if (type === 'income') { income += amount; net += amount; }
          else { expense += amount; net -= amount; }
        } else if (action === 'delete' && date === todayStr) {
          if (type === 'income') { income -= amount; net -= amount; }
          else { expense -= amount; net += amount; }
        } else if (action === 'edit' && oldTx) {
          // Avvalgisini olib tashla
          if (oldTx.date === todayStr) {
            if (oldTx.type === 'income') { income -= oldTx.amount; net -= oldTx.amount; }
            else { expense -= oldTx.amount; net += oldTx.amount; }
          }
          // Yangisini qo'sh
          if (date === todayStr) {
            if (type === 'income') { income += amount; net += amount; }
            else { expense += amount; net -= amount; }
          }
        }
        return { income, expense, net };
      });

      setMonthly((m) => {
        let { income, expense } = m;
        if (action === 'add' && date.startsWith(monthStr)) {
          if (type === 'income') income += amount;
          else expense += amount;
        } else if (action === 'delete' && date.startsWith(monthStr)) {
          if (type === 'income') income -= amount;
          else expense -= amount;
        } else if (action === 'edit' && oldTx) {
          if (oldTx.date.startsWith(monthStr)) {
            if (oldTx.type === 'income') income -= oldTx.amount;
            else expense -= oldTx.amount;
          }
          if (date.startsWith(monthStr)) {
            if (type === 'income') income += amount;
            else expense += amount;
          }
        }
        return { income, expense };
      });
    }

    // Serverdan aniq qiymatni fonovda olamiz
    getDailySummary(todayStr).then((r) => setDaily(r.data)).catch(() => {});
    getMonthlySummary(now.getMonth() + 1, now.getFullYear())
      .then((r) => setMonthly(r.data))
      .catch(() => {});

    isFirstLoad.current = false;
  }, [key]);

  return (
    <div className="top-stats-bar">
      <StatCard label="Kunlik daromad" value={daily.income} type="income" />
      <StatCard label="Kunlik xarajat" value={daily.expense} type="expense" />
      <StatCard label="Oylik daromad" value={monthly.income} type="income" />
      <StatCard label="Oylik xarajat" value={monthly.expense} type="expense" />
    </div>
  );
}
