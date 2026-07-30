import { useState } from "react";
import { fileBaseURL } from "../api/axios";
import StatusBadge from "./StatusBadge";

const ProviderDetailDrawer = ({ provider, onClose, onApprove, onReject }) => {
  const [remarks, setRemarks] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!provider) return null;

  const handleApprove = async () => {
    setSubmitting(true);
    await onApprove(provider._id);
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!remarks.trim()) return;
    setSubmitting(true);
    await onReject(provider._id, remarks);
    setSubmitting(false);
    setShowRejectForm(false);
    setRemarks("");
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink-900/40" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-ink-900">Application detail</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-ink-100 bg-ink-50">
              {provider.profilePhoto ? (
                <img src={`${fileBaseURL}${provider.profilePhoto}`} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-ink-300">No photo</div>
              )}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink-900">{provider.user?.name}</p>
              <p className="text-sm text-ink-500">{provider.user?.email}</p>
              <div className="mt-1"><StatusBadge status={provider.status} /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-ink-400">Phone</p>
              <p className="mt-0.5 text-ink-800">{provider.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-ink-400">Experience</p>
              <p className="mt-0.5 text-ink-800">{provider.experienceYears || 0} years</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold uppercase text-ink-400">Location</p>
              <p className="mt-0.5 text-ink-800">
                {[provider.location?.address, provider.location?.city, provider.location?.state, provider.location?.pincode]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-ink-400">Service categories</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(provider.serviceCategories || []).length === 0 && <span className="text-sm text-ink-400">—</span>}
              {(provider.serviceCategories || []).map((c) => (
                <span key={c} className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-ink-400">Skills</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(provider.skills || []).length === 0 && <span className="text-sm text-ink-400">—</span>}
              {(provider.skills || []).map((s) => (
                <span key={s} className="rounded-full border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-600">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-ink-400">Documents</p>
            <div className="mt-1.5 divide-y divide-ink-100 rounded-lg border border-ink-100">
              {(provider.documents || []).length === 0 && (
                <p className="p-3 text-sm text-ink-400">No documents uploaded.</p>
              )}
              {(provider.documents || []).map((doc) => (
                <a
                  key={doc._id}
                  href={`${fileBaseURL}${doc.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:underline"
                >
                  {doc.name}
                </a>
              ))}
            </div>
          </div>

          {provider.status === "rejected" && provider.rejectionRemarks && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              <span className="font-semibold">Previous remarks: </span>
              {provider.rejectionRemarks}
            </div>
          )}

          {provider.status !== "approved" && (
            <div className="space-y-3 border-t border-ink-100 pt-5">
              {!showRejectForm ? (
                <div className="flex gap-3">
                  <button onClick={handleApprove} disabled={submitting} className="btn-accent flex-1">
                    Approve
                  </button>
                  <button onClick={() => setShowRejectForm(true)} disabled={submitting} className="btn-danger flex-1">
                    Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="label">Rejection remarks</label>
                  <textarea
                    className="input min-h-[80px]"
                    placeholder="Explain what's missing or incorrect…"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleReject}
                      disabled={!remarks.trim() || submitting}
                      className="btn-danger flex-1"
                    >
                      {submitting ? "Submitting…" : "Confirm rejection"}
                    </button>
                    <button onClick={() => setShowRejectForm(false)} className="btn-outline flex-1">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailDrawer;
