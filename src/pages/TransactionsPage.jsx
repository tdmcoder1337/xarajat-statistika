import { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '../services/api';
import TransactionTable from '../components/TransactionTable';
import AddTransactionForm from '../components/AddTransactionForm';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    const res = await getTransactions();
    setTransactions(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filter);

  return (
    <div>
      <div className="page-title">
        📋 Barcha Yozuvlar
        <div className="page-subtitle">Barcha daromad va xarajatlaringizning to'liq tarixi</div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <AddTransactionForm onAdded={load} />

        <div className="card">
          <div className="section-header">
            <span className="section-title">Yozuvlar Tarixi</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'income', 'expense'].map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`}
                  style={filter !== f ? { background: '#f1f5f9', color: 'var(--text-muted)' } : {}}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'Hammasi' : f === 'income' ? '⬆ Daromad' : '⬇ Xarajat'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            {filtered.length} ta yozuv
          </div>
          <TransactionTable transactions={filtered} onDeleted={load} />
        </div>
      </div>
    </div>
  );
}
