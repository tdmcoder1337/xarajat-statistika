import { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '../services/api';
import AddTransactionForm from '../components/AddTransactionForm';
import TransactionTable from '../components/TransactionTable';

export default function DailyPage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [transactions, setTransactions] = useState([]);

  const load = useCallback(async () => {
    const t = await getTransactions({ date });
    setTransactions(t.data);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-title">
        Kunlik Hisobot
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
          <TransactionTable transactions={transactions} onDeleted={load} onEdited={load} />
        </div>
      </div>
    </div>
  );
}
