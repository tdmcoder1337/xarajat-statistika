import { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '../services/api';
import TransactionTable from '../components/TransactionTable';
import AddTransactionForm from '../components/AddTransactionForm';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showSummary, setShowSummary] = useState(false);

  const load = useCallback(async () => {
    const res = await getTransactions();
    setTransactions(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filter);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);
  const fmt = (n) => n.toLocaleString('uz-UZ') + " so'm";

  // Birinchi va oxirgi sanani topish
  const dates = transactions.map((t) => t.date).sort();
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const dayCount = firstDate && lastDate
    ? Math.round((new Date(lastDate) - new Date(firstDate)) / 86400000) + 1
    : 0;

  return (
    <div>
      <div className="page-title">
        Barcha Yozuvlar
        <div className="page-subtitle">Barcha daromad va xarajatlaringizning to'liq tarixi</div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <AddTransactionForm onAdded={load} />

        <div className="card">
          <div className="section-header">
            <span className="section-title">Yozuvlar Tarixi</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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

          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 12, width: '100%' }}
            onClick={() => setShowSummary((v) => !v)}
          >
            {showSummary ? 'Umumiyni yashirish ▲' : "Umumiy daromad va xarajatlarni ko'rish ▼"}
          </button>

          {showSummary && transactions.length > 0 && (
            <div>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 12,
                fontSize: 13,
                color: 'var(--text-muted)',
                textAlign: 'center',
              }}>
                <strong style={{ color: 'var(--text)' }}>{formatDate(firstDate)}</strong>
                {' dan '}
                <strong style={{ color: 'var(--text)' }}>{formatDate(lastDate)}</strong>
                {' gacha'}
                <span style={{ marginLeft: 8, background: '#e2e8f0', borderRadius: 4, padding: '1px 7px' }}>
                  {dayCount} kun
                </span>
              </div>

              <div className="summary-inline">
                <div className="summary-inline-item">
                  <div className="top-stat-label">Jami daromad</div>
                  <div className="top-stat-value income">{fmt(totalIncome)}</div>
                </div>
                <div className="summary-inline-item">
                  <div className="top-stat-label">Jami xarajat</div>
                  <div className="top-stat-value expense">{fmt(totalExpense)}</div>
                </div>
                <div className="summary-inline-item">
                  <div className="top-stat-label">Sof foyda</div>
                  <div className="top-stat-value net">{fmt(totalIncome - totalExpense)}</div>
                </div>
              </div>
            </div>
          )}

          {showSummary && transactions.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '8px 0 12px', fontSize: 13 }}>
              Hali yozuv yo'q
            </div>
          )}

          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            {filtered.length} ta yozuv
          </div>
          <TransactionTable transactions={filtered} onDeleted={load} onEdited={load} />
        </div>
      </div>
    </div>
  );
}
