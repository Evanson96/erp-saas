import { BarChart3, Boxes, ClipboardList, CreditCard, History, LogOut, ReceiptText, Search, ShieldCheck, Truck, Users } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../utils/auth";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
  { label: "Inventory", path: "/inventory", icon: Boxes },
  { label: "Purchasing", path: "/purchasing", icon: Truck },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Sales Orders", path: "/sales-orders", icon: ReceiptText },
  { label: "Billing", path: "/billing", icon: CreditCard },
  { label: "Staff", path: "/staff", icon: ShieldCheck },
  { label: "Audit Logs", path: "/audit-logs", icon: History },
  { label: "Reports", path: "/reports", icon: ClipboardList },
];

function ModuleLayout({ children, eyebrow, title, description }) {
  const navigate = useNavigate();
  const user = getUser();

  const handleSignOut = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-[#eef3f7] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white md:block">
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
                <BarChart3 size={22} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-950">ERP SaaS</h1>
                <p className="text-xs font-medium text-slate-500">Operations suite</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-4 py-5 text-sm">
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 font-medium ${
                    isActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
                key={path}
                to={path}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mx-4 mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Tenant secured</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Every module is scoped to your company workspace.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{eyebrow || user?.email || "Workspace"}</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h2>
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 lg:flex">
                  <Search size={16} />
                  Search modules
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  onClick={handleSignOut}
                  type="button"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6">{children}</div>
        </section>
      </div>
    </main>
  );
}

export default ModuleLayout;
