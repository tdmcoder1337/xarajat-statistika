import { useState, useEffect, useCallback } from 'react';
import { getDailySummary, getTransactions } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import AddTransactionForm from '../components/AddTransactionForm';
import TransactionTable from '../components/TransactionTable';

export default function DailyPage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [transactions, setTransactions] = useState([]);

  const load = useCallback(async () => {
    const [s, t] = await Promise.all([
      getDailySummary(date),
      getTransactions({ date }),
    ]);
    setSummary(s.data);
    setTransactions(t.data);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-title">
        📅 Kunlik Hisobot
        <div className="page-subtitle">Bugungi daromad va xarajatlaringiz</div>
      </div>

      <div className="date-selector">
        <label>Sanani tanlang:</label>
        <input
          className="form-control"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: 'auto' }}
        />
      </div>

      <div className="grid-3">
        <SummaryCard
          title="Daromad"
          value={summary.income}
          type="income"
          icon="⬆"
        />
        <SummaryCard
          title="Xarajat"
          value={summary.expense}
          type="expense"
          icon="⬇"
        />
        <SummaryCard
          title="Sof Foyda"
          value={summary.net}
          type="net"
          icon="💰"
        />
      </div>

      <div className="grid-2">
        <AddTransactionForm defaultDate={date} onAdded={load} />

        <div className="card">
          <div className="section-header">
            <span className="section-title">
              {date === today ? 'Bugungi Yozuvlar' : `${date} Yozuvlar`}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {transactions.length} ta
            </span>
          </div>
          <TransactionTable transactions={transactions} onDeleted={load} />
        </div>
      </div>
    </div>
  );
}
