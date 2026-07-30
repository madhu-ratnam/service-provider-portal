import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const TopBar = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-ink-100 bg-white px-6 py-4 sm:px-8">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-ink-800">{user?.name}</p>
          <p className="text-xs capitalize text-ink-400">{user?.role}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 font-display text-sm font-semibold text-ink-700">
          {user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <button onClick={handleLogout} className="btn-outline !px-3 !py-2 text-xs">
          Sign out
        </button>
      </div>
    </header>
  );
};

export default TopBar;
