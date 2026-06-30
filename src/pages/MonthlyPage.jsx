import { useState, useEffect, useCallback } from 'react';
import { getMonthlySummary, getTransactions } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import TransactionTable from '../components/TransactionTable';
import AddTransactionForm from '../components/AddTransactionForm';

const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

export default function MonthlyPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0, dailyAvgIncome: 0 });
  const [transactions, setTransactions] = useState([]);

  const load = useCallback(async () => {
    const [s, t] = await Promise.all([
      getMonthlySummary(month, year),
      getTransactions({ month, year }),
    ]);
    setSummary(s.data);
    setTransactions(t.data);
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div>
      <div className="page-title">
        📊 Oylik Hisobot
        <div className="page-subtitle">Oylik umumiy daromad va xarajatlar</div>
      </div>

      <div className="month-nav" style={{ marginBottom: 24 }}>
        <button onClick={prevMonth}>‹</button>
        <span>{MONTHS[month - 1]} {year}</span>
        <button onClick={nextMonth}>›</button>
      </div>

      <div className="grid-3">
        <SummaryCard title="Jami Daromad" value={summary.income} type="income" icon="⬆" />
        <SummaryCard title="Jami Xarajat" value={summary.expense} type="expense" icon="⬇" />
        <SummaryCard title="Sof Foyda" value={summary.net} type="net" icon="💰" />
      </div>

      {/* Kunlik o'rtacha */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>📈 Kunlik Ko'rsatkichlar</div>
        <div className="grid-2">
          <div>
            <div className="card-title">1 kunda o'rtacha daromad</div>
            <div className="card-value income" style={{ fontSize: 20 }}>
              {Math.round(summary.dailyAvgIncome).toLocaleString('uz-UZ')} so'm
            </div>
          </div>
          <div>
            <div className="card-title">1 kunda o'rtacha xarajat</div>
            <div className="card-value expense" style={{ fontSize: 20 }}>
              {Math.round(summary.expense / (summary.daysInMonth || 30)).toLocaleString('uz-UZ')} so'm
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <AddTransactionForm onAdded={load} />

        <div className="card">
          <div className="section-header">
            <span className="section-title">{MONTHS[month - 1]} Yozuvlari</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{transactions.length} ta</span>
          </div>
          <TransactionTable transactions={transactions} onDeleted={load} />
        </div>
      </div>
    </div>
  );
}
