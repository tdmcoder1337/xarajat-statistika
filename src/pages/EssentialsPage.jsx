import { useState, useEffect } from 'react';
import { getEssentials, createEssential, updateEssential, deleteEssential, getDailySummary } from '../services/api';

export default function EssentialsPage() {
  const [essentials, setEssentials] = useState([]);
  const [dailyIncome, setDailyIncome] = useState(0);
  const [form, setForm] = useState({ name: '', amount: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', amount: '' });
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const load = async () => {
    const [e, d] = await Promise.all([
      getEssentials(),
      getDailySummary(today),
    ]);
    setEssentials(e.data);
    setDailyIncome(d.data.income);
  };

  useEffect(() => { load(); }, []);

  const totalEssential = essentials.reduce((s, e) => s + e.amount, 0);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount) { setError('Nom va miqdorni kiriting'); return; }
    setError('');
    await createEssential({ name: form.name, amount: parseFloat(form.amount) });
    setForm({ name: '', amount: '' });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('O\'chirishni tasdiqlaysizmi?')) return;
    await deleteEssential(id);
    load();
  };

  const startEdit = (item) => {
    setEditId(item._id || item.id);
    setEditForm({ name: item.name, amount: item.amount });
  };

  const handleUpdate = async (id) => {
    await updateEssential(id, { name: editForm.name, amount: parseFloat(editForm.amount) });
    setEditId(null);
    load();
  };

  const getSavingsDays = (amount) => {
    if (!dailyIncome || dailyIncome <= 0) return null;
    return Math.ceil(amount / dailyIncome);
  };

  return (
    <div>
      <div className="page-title">
        ⭐ Muhim Xarajatlar
        <div className="page-subtitle">
          Zaruriy xarajatlaringizni kiriting — bugungi daromad asosida yig'ish hisoblanadi
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>Yangi Muhim Xarajat</div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label>Xarajat nomi</label>
              <input
                className="form-control"
                placeholder="Masalan: Ijara, Oziq-ovqat, Internet..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Oylik miqdor (so'm)</label>
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
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              ⭐ Qo'shish
            </button>
          </form>

          <div className="savings-box" style={{ marginTop: 16 }}>
            <div className="savings-box-title">💡 Bugungi daromad asosi</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--income)' }}>
              {dailyIncome.toLocaleString('uz-UZ')} so'm
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Bugun kiritilgan daromad asosida yig'ish hisoblanadi
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>📊 Umumiy Ko'rsatkichlar</div>

          <div style={{ marginBottom: 16 }}>
            <div className="card-title">Jami muhim xarajatlar (oyiga)</div>
            <div className="card-value expense">{totalEssential.toLocaleString('uz-UZ')} so'm</div>
          </div>

          {dailyIncome > 0 && (
            <>
              <div style={{ marginBottom: 10 }}>
                <div className="card-title">Jami yig'ish uchun</div>
                <div className="card-value net" style={{ fontSize: 20 }}>
                  {getSavingsDays(totalEssential)} kun
                </div>
              </div>
              <div className="savings-box">
                <div className="savings-box-title">📅 Oylik hisob</div>
                <div className="savings-progress">
                  <span>30 kun × {dailyIncome.toLocaleString('uz-UZ')} so'm</span>
                  <strong>= {(dailyIncome * 30).toLocaleString('uz-UZ')} so'm</strong>
                </div>
                <div className="savings-progress" style={{ marginTop: 4 }}>
                  <span>Xarajatlardan keyin:</span>
                  <strong style={{ color: (dailyIncome * 30 - totalEssential) >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                    {(dailyIncome * 30 - totalEssential).toLocaleString('uz-UZ')} so'm
                  </strong>
                </div>
              </div>
            </>
          )}

          {!dailyIncome && (
            <div className="empty-state" style={{ padding: 16 }}>
              Bugun daromad kiriting — yig'ish hisob-kitobi paydo bo'ladi
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="section-header">
          <span className="section-title">Muhim Xarajatlar Ro'yxati</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{essentials.length} ta</span>
        </div>

        {!essentials.length && (
          <div className="empty-state">Hali muhim xarajat qo'shilmagan</div>
        )}

        {essentials.map((item) => {
          const itemId = item._id || item.id;
          return (
            <div key={itemId} className="essential-item">
              {editId === itemId ? (
                <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    className="form-control"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ flex: '2 1 120px' }}
                  />
                  <input
                    className="form-control"
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    style={{ flex: '1 1 80px' }}
                    inputMode="numeric"
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-income" onClick={() => handleUpdate(itemId)}>✓</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setEditId(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="essential-name">{item.name}</div>
                    {dailyIncome > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Yig'ish: <strong>{getSavingsDays(item.amount)} kun</strong>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div className="essential-amount">{item.amount.toLocaleString('uz-UZ')} so'm</div>
                    <div className="essential-actions">
                      <button className="btn btn-sm btn-edit" onClick={() => startEdit(item)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(itemId)}>🗑</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
