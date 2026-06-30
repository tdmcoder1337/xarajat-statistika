import { useState } from 'react';
import { deleteTransaction, updateTransaction } from '../services/api';

function EditModal({ tx, onClose, onSaved }) {
  const [type, setType] = useState(tx.type);
  const [form, setForm] = useState({
    amount: tx.amount,
    description: tx.description,
    date: tx.date,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) {
      setError('Miqdor va tavsif kiritilishi shart');
      return;
    }
    setLoading(true);
    try {
      await updateTransaction(tx._id || tx.id, { ...form, type });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Saqlashda xatolik');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Yozuvni Tahrirlash</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
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
            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TransactionTable({ transactions, onDeleted, onEdited }) {
  const [editing, setEditing] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Bu yozuvni o'chirmoqchimisiz?")) return;
    await deleteTransaction(id);
    onDeleted();
  };

  if (!transactions.length) {
    return <div className="empty-state">Hali yozuv yo'q</div>;
  }

  return (
    <>
      <div className="tx-list">
        {transactions.map((t) => (
          <div key={t._id || t.id} className="tx-item">
            <div className={`tx-badge ${t.type}`}>
              {t.type === 'income' ? '⬆' : '⬇'}
            </div>
            <div className="tx-info">
              <div className="tx-desc">{t.description}</div>
              <div className="tx-date">{t.date}</div>
            </div>
            <div className={`tx-amount ${t.type}`}>
              {t.type === 'income' ? '+' : '-'}
              {Number(t.amount).toLocaleString('uz-UZ')}
            </div>
            <button
              className="tx-edit"
              onClick={() => setEditing(t)}
            >
              Tahrir
            </button>
            <button
              className="tx-delete"
              onClick={() => handleDelete(t._id || t.id)}
            >
              O'chir
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <EditModal
          tx={editing}
          onClose={() => setEditing(null)}
          onSaved={onEdited}
        />
      )}
    </>
  );
}
