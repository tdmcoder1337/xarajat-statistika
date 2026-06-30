import { deleteTransaction } from '../services/api';

export default function TransactionTable({ transactions, onDeleted }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Bu yozuvni o\'chirmoqchimisiz?')) return;
    await deleteTransaction(id);
    onDeleted();
  };

  if (!transactions.length) {
    return <div className="empty-state">📭 Hali yozuv yo'q</div>;
  }

  return (
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
            className="tx-delete"
            onClick={() => handleDelete(t._id || t.id)}
            title="O'chirish"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
