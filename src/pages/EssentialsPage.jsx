import { useState, useEffect } from 'react';
import { getEssentials, createEssential, updateEssential, deleteEssential, getMonthlySummary } from '../services/api';

function formatAmount(val) {
  const digits = String(val).replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function fmt(n) {
  return Number(n).toLocaleString('uz-UZ') + " so'm";
}

export default function EssentialsPage() {
  const [essentials, setEssentials] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [form, setForm] = useState({ name: '', amount: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', amount: '' });
  const [error, setError] = useState('');

  const load = async () => {
    const now = new Date();
    const [e, m] = await Promise.all([
      getEssentials(),
      getMonthlySummary(now.getMonth() + 1, now.getFullYear()),
    ]);
    setEssentials(e.data);
    // Agar foydalanuvchi o'zi kiritmagan bo'lsa, haqiqiy oylik daromadni qo'yamiz
    if (!monthlyIncome) {
      const income = m.data.income || 0;
      if (income > 0) setMonthlyIncome(formatAmount(String(income)));
    }
  };

  useEffect(() => { load(); }, []);

  const totalEssential = essentials.reduce((s, e) => s + e.amount, 0);
  const rawIncome = Number(monthlyIncome.replace(/\s/g, '')) || 0;
  const remaining = rawIncome - totalEssential;
  const coverPercent = rawIncome > 0 ? Math.min(100, Math.round((totalEssential / rawIncome) * 100)) : 0;

  // Bir oyda qancha yig'ish mumkin (daromad - muhim xarajatlar)
  const monthlySavings = remaining > 0 ? remaining : 0;

  const getMonthsToSave = (amount) => {
    if (!monthlySavings || monthlySavings <= 0) return null;
    const months = amount / monthlySavings;
    if (months < 1) return `${Math.ceil(months * 30)} kun`;
    return `${months.toFixed(1)} oy`;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount) { setError('Nom va miqdorni kiriting'); return; }
    setError('');
    await createEssential({ name: form.name, amount: Number(form.amount.replace(/\s/g, '')) });
    setForm({ name: '', amount: '' });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    await deleteEssential(id);
    load();
  };

  const startEdit = (item) => {
    setEditId(item._id || item.id);
    setEditForm({ name: item.name, amount: formatAmount(String(item.amount)) });
  };

  const handleUpdate = async (id) => {
    await updateEssential(id, {
      name: editForm.name,
      amount: Number(editForm.amount.replace(/\s/g, '')),
    });
    setEditId(null);
    load();
  };

  return (
    <div>
      <div className="page-title">
        Muhim Xarajatlar
        <div className="page-subtitle">
          Oylik daromadingizga qarab muhim xarajatlar uchun yig'ish hisoblanadi
        </div>
      </div>

      <div className="grid-2">
        {/* Chap: qo'shish + daromad */}
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
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: formatAmount(e.target.value) })}
              />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
              Qo'shish
            </button>
          </form>

          <div style={{ marginTop: 20, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
            <div className="section-title" style={{ marginBottom: 10, fontSize: 14 }}>
              Oylik daromadingiz
            </div>
            <input
              className="form-control"
              type="text"
              inputMode="numeric"
              placeholder="Oylik daromadingizni kiriting..."
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(formatAmount(e.target.value))}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Bu oyda kiritilgan daromad asosida avtomatik to'ldiriladi
            </div>
          </div>
        </div>

        {/* O'ng: hisob-kitob */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>Hisob-kitob</div>

          {rawIncome > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Oylik daromad</span>
                  <strong style={{ color: 'var(--income)' }}>{fmt(rawIncome)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Jami muhim xarajat</span>
                  <strong style={{ color: 'var(--expense)' }}>− {fmt(totalEssential)}</strong>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${coverPercent}%`,
                      background: coverPercent >= 100 ? 'var(--expense)' : coverPercent > 70 ? '#f59e0b' : 'var(--income)',
                      borderRadius: 4,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Daromadning {coverPercent}% muhim xarajatlarga ketadi
                  </div>
                </div>

                <div style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Qolgan (yig'ish uchun)</span>
                  <strong style={{
                    fontSize: 18,
                    color: remaining >= 0 ? 'var(--income)' : 'var(--expense)',
                  }}>
                    {fmt(remaining)}
                  </strong>
                </div>

                {remaining <= 0 && (
                  <div className="alert alert-error" style={{ fontSize: 12, margin: 0 }}>
                    Daromad muhim xarajatlarni qoplamayapti! Oyiga kamida {fmt(totalEssential)} topish kerak.
                  </div>
                )}

                {remaining > 0 && (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 13,
                  }}>
                    Har oyda <strong style={{ color: 'var(--income)' }}>{fmt(monthlySavings)}</strong> yig'ish mumkin
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: 24 }}>
              Oylik daromadingizni kiriting — hisob-kitob paydo bo'ladi
            </div>
          )}
        </div>
      </div>

      {/* Ro'yxat */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="section-header">
          <span className="section-title">Muhim Xarajatlar Ro'yxati</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{essentials.length} ta</span>
        </div>

        {!essentials.length && (
          <div className="empty-state">Hali muhim xarajat qo'shilmagan</div>
        )}

        <div style={{ maxHeight: 'calc(4 * 72px)', overflowY: 'auto' }}>
        {essentials.map((item) => {
          const itemId = item._id || item.id;
          const saveTime = getMonthsToSave(item.amount);
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
                    type="text"
                    inputMode="numeric"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: formatAmount(e.target.value) })}
                    style={{ flex: '1 1 80px' }}
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
                    {saveTime && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Yig'ish muddati: <strong style={{ color: 'var(--text)' }}>{saveTime}</strong>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div className="essential-amount">{fmt(item.amount)}</div>
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
    </div>
  );
}
