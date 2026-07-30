import { useEffect, useState } from "react";
import api, { fileBaseURL } from "../api/axios";
import TopBar from "../components/TopBar";
import StatusBadge from "../components/StatusBadge";
import PipelineTracker from "../components/PipelineTracker";
import { SERVICE_CATEGORIES } from "../constants";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "documents", label: "Documents" },
  { key: "status", label: "Application status" },
];

const emptyLocation = { address: "", city: "", state: "", pincode: "" };

const ProviderDashboard = () => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    phone: "",
    experienceYears: 0,
    serviceCategories: [],
    skillsInput: "",
    location: emptyLocation,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [docFiles, setDocFiles] = useState([]);

  const isLocked = provider?.status === "approved";

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/provider/profile");
      const p = res.data.provider;
      setProvider(p);
      setForm({
        phone: p.phone || "",
        experienceYears: p.experienceYears || 0,
        serviceCategories: p.serviceCategories || [],
        skillsInput: (p.skills || []).join(", "),
        location: { ...emptyLocation, ...p.location },
      });
    } catch (err) {
      setMessage({ type: "error", text: "Could not load your profile." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleCategory = (cat) => {
    setForm((f) => ({
      ...f,
      serviceCategories: f.serviceCategories.includes(cat)
        ? f.serviceCategories.filter((c) => c !== cat)
        : [...f.serviceCategories, cat],
    }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        phone: form.phone,
        experienceYears: Number(form.experienceYears) || 0,
        serviceCategories: form.serviceCategories,
        skills: form.skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        location: form.location,
      };
      const res = await api.put("/provider/profile", payload);
      setProvider(res.data.provider);
      setMessage({ type: "success", text: "Profile saved." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Could not save profile." });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setSaving(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("photo", photoFile);
      const res = await api.post("/provider/upload-photo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProvider((p) => ({ ...p, profilePhoto: res.data.profilePhoto }));
      setPhotoFile(null);
      setMessage({ type: "success", text: "Profile photo updated." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Photo upload failed." });
    } finally {
      setSaving(false);
    }
  };

  const handleDocsUpload = async () => {
    if (docFiles.length === 0) return;
    setSaving(true);
    setMessage(null);
    try {
      const fd = new FormData();
      docFiles.forEach((f) => fd.append("documents", f));
      const res = await api.post("/provider/upload-documents", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProvider((p) => ({ ...p, documents: res.data.documents }));
      setDocFiles([]);
      setMessage({ type: "success", text: "Documents uploaded." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Document upload failed." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      const res = await api.delete(`/provider/documents/${docId}`);
      setProvider((p) => ({ ...p, documents: res.data.documents }));
    } catch (err) {
      setMessage({ type: "error", text: "Could not remove document." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <TopBar title="My application" subtitle="Complete your profile to get verified" />

      <main className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
        <div className="card mb-6 p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Onboarding pipeline</p>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={provider.status} />
                {provider.status === "rejected" && (
                  <span className="text-xs text-ink-400">You can edit and resubmit</span>
                )}
              </div>
            </div>
          </div>
          <PipelineTracker
            profileCompleted={provider.profileCompleted}
            documentsCount={provider.documents?.length || 0}
            status={provider.status}
          />
          {provider.status === "rejected" && provider.rejectionRemarks && (
            <div className="mt-5 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              <span className="font-semibold">Reviewer remarks: </span>
              {provider.rejectionRemarks}
            </div>
          )}
          {isLocked && (
            <div className="mt-5 rounded-lg border border-ok/20 bg-ok/5 px-4 py-3 text-sm text-ok">
              Your application is approved. Profile editing is now locked.
            </div>
          )}
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-ok/20 bg-ok/5 text-ok"
                : "border-danger/20 bg-danger/5 text-danger"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-6 flex gap-1 rounded-lg bg-ink-100 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                tab === t.key ? "bg-white text-ink-900 shadow-soft" : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="card p-6">
            <form onSubmit={handleProfileSave} className="space-y-6">
              <fieldset disabled={isLocked} className="space-y-6 disabled:opacity-60">
                <div>
                  <h3 className="font-display text-base font-semibold text-ink-900">Profile photo</h3>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-full border border-ink-100 bg-ink-50">
                      {provider.profilePhoto ? (
                        <img
                          src={`${fileBaseURL}${provider.profilePhoto}`}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-ink-300">
                          No photo
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhotoFile(e.target.files[0])}
                        className="text-xs text-ink-500 file:mr-3 file:rounded-md file:border-0 file:bg-ink-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink-700"
                      />
                      <button
                        type="button"
                        onClick={handlePhotoUpload}
                        disabled={!photoFile || saving}
                        className="btn-outline !px-3 !py-1.5 text-xs"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Phone number</label>
                    <input
                      className="input"
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Years of experience</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={form.experienceYears}
                      onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Service categories</label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_CATEGORIES.map((cat) => {
                      const active = form.serviceCategories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "border-ink-800 bg-ink-800 text-white"
                              : "border-ink-200 bg-white text-ink-600 hover:border-ink-400"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label">Skills</label>
                  <input
                    className="input"
                    placeholder="e.g. Wiring, Pipe fitting, Deep cleaning (comma separated)"
                    value={form.skillsInput}
                    onChange={(e) => setForm({ ...form, skillsInput: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-ink-400">Separate multiple skills with commas.</p>
                </div>

                <div>
                  <label className="label">Service location</label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      className="input"
                      placeholder="Address"
                      value={form.location.address}
                      onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })}
                    />
                    <input
                      className="input"
                      placeholder="City"
                      value={form.location.city}
                      onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })}
                    />
                    <input
                      className="input"
                      placeholder="State"
                      value={form.location.state}
                      onChange={(e) => setForm({ ...form, location: { ...form.location, state: e.target.value } })}
                    />
                    <input
                      className="input"
                      placeholder="Pincode"
                      value={form.location.pincode}
                      onChange={(e) => setForm({ ...form, location: { ...form.location, pincode: e.target.value } })}
                    />
                  </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Saving…" : "Save profile"}
                </button>
              </fieldset>
            </form>
          </div>
        )}

        {tab === "documents" && (
          <div className="card p-6">
            <h3 className="font-display text-base font-semibold text-ink-900">Verification documents</h3>
            <p className="mt-1 text-sm text-ink-500">Upload ID proof, address proof, or certifications (PDF, JPG, PNG — max 10MB each).</p>

            {!isLocked && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setDocFiles(Array.from(e.target.files))}
                  className="text-xs text-ink-500 file:mr-3 file:rounded-md file:border-0 file:bg-ink-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink-700"
                />
                <button
                  onClick={handleDocsUpload}
                  disabled={docFiles.length === 0 || saving}
                  className="btn-outline !px-3 !py-1.5 text-xs"
                >
                  Upload {docFiles.length > 0 ? `(${docFiles.length})` : ""}
                </button>
              </div>
            )}

            <div className="mt-5 divide-y divide-ink-100 rounded-lg border border-ink-100">
              {(provider.documents || []).length === 0 && (
                <p className="p-4 text-sm text-ink-400">No documents uploaded yet.</p>
              )}
              {(provider.documents || []).map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-4">
                  <a
                    href={`${fileBaseURL}${doc.path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-ink-700 hover:underline"
                  >
                    {doc.name}
                  </a>
                  {!isLocked && (
                    <button
                      onClick={() => handleDeleteDoc(doc._id)}
                      className="text-xs font-semibold text-danger hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "status" && (
          <div className="card p-6">
            <h3 className="font-display text-base font-semibold text-ink-900">Application status</h3>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-ink-100 p-4">
                <dt className="text-xs font-semibold uppercase text-ink-400">Status</dt>
                <dd className="mt-1"><StatusBadge status={provider.status} /></dd>
              </div>
              <div className="rounded-lg border border-ink-100 p-4">
                <dt className="text-xs font-semibold uppercase text-ink-400">Profile</dt>
                <dd className="mt-1 text-sm font-medium text-ink-800">
                  {provider.profileCompleted ? "Complete" : "Incomplete"}
                </dd>
              </div>
              <div className="rounded-lg border border-ink-100 p-4">
                <dt className="text-xs font-semibold uppercase text-ink-400">Documents</dt>
                <dd className="mt-1 text-sm font-medium text-ink-800">
                  {provider.documents?.length || 0} uploaded
                </dd>
              </div>
            </dl>
            {provider.status === "rejected" && provider.rejectionRemarks && (
              <div className="mt-5 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                <span className="font-semibold">Reviewer remarks: </span>
                {provider.rejectionRemarks}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderDashboard;
