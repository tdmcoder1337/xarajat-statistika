import { useState } from 'react';
import { createTransaction } from '../services/api';
import { useRefresh } from '../context/RefreshContext';

export default function AddTransactionForm({ defaultDate, onAdded }) {
  const today = defaultDate || new Date().toISOString().split('T')[0];
  const [type, setType] = useState('income');
  const [form, setForm] = useState({ amount: '', description: '', date: today });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { refresh } = useRefresh();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) {
      setError('Miqdor va tavsif kiritilishi shart');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createTransaction({ ...form, type });
      setForm({ amount: '', description: '', date: today });
      refresh({ action: 'add', type, amount: parseFloat(form.amount), date: form.date });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Saqlashda xatolik');
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 16 }}>Yangi Yozuv Qo'shish</div>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="type-toggle">
          <button
            type="button"
            className={`type-btn income ${type === 'income' ? 'active' : ''}`}
            onClick={() => setType('income')}
          >
            ⬆ Daromad
          </button>
          <button
            type="button"
            className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}
            onClick={() => setType('expense')}
          >
            ⬇ Xarajat
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Miqdor (so'm)</label>
            <input
              className="form-control"
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              min="0"
              inputMode="numeric"
            />
          </div>
          <div className="form-group">
            <label>Sana</label>
            <input
              className="form-control"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Tavsif</label>
          <input
            className="form-control"
            type="text"
            placeholder="Masalan: Maosh, Mahsulot sotish..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <button
          className={`btn ${type === 'income' ? 'btn-income' : 'btn-expense'}`}
          type="submit"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Saqlanmoqda...' : `${type === 'income' ? '⬆ Daromad' : '⬇ Xarajat'} Qo'shish`}
        </button>
      </form>
    </div>
  );
}
