const StatCard = ({ label, value, accent }) => (
  <div className="card p-5">
    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
    <p className={`mt-2 font-display text-3xl font-bold ${accent || "text-ink-900"}`}>{value}</p>
  </div>
);

export default StatCard;
