const styles = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-ok/10 text-ok border-ok/20",
  rejected: "bg-danger/10 text-danger border-danger/20",
};

const labels = {
  pending: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide ${
        styles[status] || styles.pending
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
