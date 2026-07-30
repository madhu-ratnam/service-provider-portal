import { useEffect, useState, useCallback } from "react";
import api, { fileBaseURL } from "../api/axios";
import TopBar from "../components/TopBar";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import ProviderDetailDrawer from "../components/ProviderDetailDrawer";
import { SERVICE_CATEGORIES } from "../constants";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const fetchStats = async () => {
    const res = await api.get("/admin/stats");
    setStats(res.data.stats);
  };

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/providers", {
        params: { search, status, category, page, limit: 8 },
      });
      setProviders(res.data.providers);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, page]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const openDetail = async (id) => {
    const res = await api.get(`/admin/providers/${id}`);
    setSelected(res.data.provider);
  };

  const handleApprove = async (id) => {
    await api.put(`/admin/providers/${id}/approve`);
    await fetchProviders();
    await fetchStats();
    setSelected(null);
  };

  const handleReject = async (id, remarks) => {
    await api.put(`/admin/providers/${id}/reject`, { remarks });
    await fetchProviders();
    await fetchStats();
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-paper">
      <TopBar title="Admin dashboard" subtitle="Review and manage provider applications" />

      <main className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total applicants" value={stats.total} />
            <StatCard label="Pending review" value={stats.pending} accent="text-amber-500" />
            <StatCard label="Approved" value={stats.approved} accent="text-ok" />
            <StatCard label="Rejected" value={stats.rejected} accent="text-danger" />
          </div>
        )}

        <div className="card mb-6 p-4">
          <div className="flex flex-wrap gap-3">
            <input
              className="input max-w-xs"
              placeholder="Search by name, email, city…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <select
              className="input max-w-[10rem]"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              className="input max-w-[12rem]"
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
            >
              <option value="">All categories</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50 text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3">Provider</th>
                  <th className="px-5 py-3">Categories</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Documents</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-ink-400">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && providers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-ink-400">
                      No providers match your filters.
                    </td>
                  </tr>
                )}
                {!loading &&
                  providers.map((p) => (
                    <tr key={p._id} className="hover:bg-ink-50/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 overflow-hidden rounded-full border border-ink-100 bg-ink-50">
                            {p.profilePhoto ? (
                              <img
                                src={`${fileBaseURL}${p.profilePhoto}`}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div>
                            <p className="font-medium text-ink-800">{p.user?.name}</p>
                            <p className="text-xs text-ink-400">{p.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink-600">
                        {(p.serviceCategories || []).slice(0, 2).join(", ") || "—"}
                        {p.serviceCategories?.length > 2 && ` +${p.serviceCategories.length - 2}`}
                      </td>
                      <td className="px-5 py-3.5 text-ink-600">{p.location?.city || "—"}</td>
                      <td className="px-5 py-3.5 text-ink-600">{p.documents?.length || 0}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openDetail(p._id)}
                          className="text-xs font-semibold text-ink-700 hover:underline"
                        >
                          Review →
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3 text-sm text-ink-500">
            <span>
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-outline !px-3 !py-1.5 text-xs"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-outline !px-3 !py-1.5 text-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {selected && (
        <ProviderDetailDrawer
          provider={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
