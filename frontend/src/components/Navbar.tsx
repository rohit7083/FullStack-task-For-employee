import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout } from "../features/auth/authSlice";
import NotificationBell from "../features/notifications/NotificationBell";

const navItemsBase = [
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/tasks", label: "Tasks", icon: "☑" },
];

const adminOnlyItems = [
  { to: "/employees", label: "Employees", icon: "◈" },
  { to: "/reports", label: "Reports", icon: "▤" },
];

const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const navItems = user?.role === "Admin" ? [...navItemsBase, ...adminOnlyItems] : navItemsBase;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-ink text-white flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/50">
            TaskFlow
          </p>
          <h1 className="font-display text-xl font-semibold mt-1">Task Manager</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-brand text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span aria-hidden className="text-base leading-none">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-sm font-medium truncate">{user?.fullName}</p>
          <p className="text-xs text-white/50 truncate">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-left text-sm text-white/70 hover:text-white transition-colors"
          >
            Log out →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-panel border-b border-border flex items-center justify-end px-6 gap-3">
          <NotificationBell />
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Navbar;
