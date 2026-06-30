export default function SummaryCard({ title, value, type, icon }) {
  const formatted = typeof value === 'number'
    ? value.toLocaleString('uz-UZ') + ' so\'m'
    : value;

  return (
    <div className="card">
      <div className="card-title">{icon} {title}</div>
      <div className={`card-value ${type}`}>{formatted}</div>
    </div>
  );
}
