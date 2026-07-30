import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/provider/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 font-display text-lg font-bold text-ink-900">
            P
          </div>
          <span className="font-display text-xl font-semibold">ProDesk</span>
        </div>
        <div>
          <p className="font-display text-3xl font-semibold leading-tight text-white">
            Onboard service providers without the paperwork chase.
          </p>
          <p className="mt-4 max-w-md text-sm text-ink-200">
            Providers register, upload documents, and track their status in one place. Admins
            review, approve, and manage the whole pipeline from a single dashboard.
          </p>
        </div>
        <p className="font-mono text-xs text-ink-300">Service Provider Onboarding Portal</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 font-display text-lg font-bold text-ink-900">
                P
              </div>
              <span className="font-display text-xl font-semibold text-ink-900">ProDesk</span>
            </div>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink-900">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to continue to your dashboard.</p>

          {error && (
            <div className="mt-5 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            New service provider?{" "}
            <Link to="/register" className="font-semibold text-ink-800 hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-8 rounded-lg border border-ink-100 bg-ink-50 px-4 py-3 text-xs text-ink-500">
            <span className="font-semibold text-ink-700">Admin demo login:</span> use the admin
            credentials from your <code className="font-mono">.env</code> file (seeded via{" "}
            <code className="font-mono">npm run seed:admin</code>).
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
