import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  LogOut,
  PackagePlus,
  ReceiptText,
  Search,
  ShoppingCart,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import { clearAuth, getUser } from "../utils/auth";

const formatCurrency = (amount) => {
  return `KES ${Number(amount || 0).toLocaleString()}`;
};

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  shipped: "bg-sky-50 text-sky-700 ring-sky-200",
  completed: "bg-teal-50 text-teal-700 ring-teal-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsResponse, customersResponse, ordersResponse] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/customers"),
          api.get("/api/orders"),
        ]);

        setProducts(productsResponse.data.products || []);
        setCustomers(customersResponse.data.customers || []);
        setOrders(ordersResponse.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const revenue = useMemo(() => {
    return orders.reduce((total, order) => total + Number(order.total_amount || 0), 0);
  }, [orders]);

  const inventoryValue = useMemo(() => {
    return products.reduce((total, product) => {
      return total + Number(product.price || 0) * Number(product.stock_quantity || 0);
    }, 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((product) => Number(product.stock_quantity) <= Number(product.reorder_level))
      .slice(0, 5);
  }, [products]);

  const statusCounts = useMemo(() => {
    const counts = {
      pending: 0,
      paid: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });

    return counts;
  }, [orders]);

  const stockChart = useMemo(() => {
    return products.slice(0, 6).map((product) => ({
      name: product.name,
      quantity: Number(product.stock_quantity || 0),
    }));
  }, [products]);

  const maxStock = useMemo(() => {
    return Math.max(...stockChart.map((item) => item.quantity), 1);
  }, [stockChart]);

  const metrics = [
    {
      label: "Revenue",
      value: formatCurrency(revenue),
      detail: `${orders.length} total orders`,
      icon: Wallet,
      accent: "bg-teal-600",
      surface: "bg-teal-50",
      text: "text-teal-700",
    },
    {
      label: "Inventory Value",
      value: formatCurrency(inventoryValue),
      detail: `${products.length} active products`,
      icon: Boxes,
      accent: "bg-indigo-600",
      surface: "bg-indigo-50",
      text: "text-indigo-700",
    },
    {
      label: "Customers",
      value: customers.length,
      detail: "Customer accounts",
      icon: Users,
      accent: "bg-amber-500",
      surface: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      label: "Low Stock",
      value: lowStockProducts.length,
      detail: "Needs attention",
      icon: AlertTriangle,
      accent: "bg-rose-500",
      surface: "bg-rose-50",
      text: "text-rose-700",
    },
  ];

  const quickActions = [
    { label: "Add product", icon: PackagePlus, path: "/inventory" },
    { label: "New customer", icon: Building2, path: "/customers" },
    { label: "Create order", icon: ShoppingCart, path: "/sales-orders" },
  ];

  const handleSignOut = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-[#f2f6f3] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white md:block">
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1b7f35] text-white">
                <BarChart3 size={22} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-950">ERP SaaS Kenya</h1>
                <p className="text-xs font-medium text-slate-500">KES operations suite</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-4 py-5 text-sm">
            {[
              [BarChart3, "Dashboard", "/dashboard"],
              [Boxes, "Inventory", "/inventory"],
              [Users, "Customers", "/customers"],
              [ReceiptText, "Sales Orders", "/sales-orders"],
              [CreditCard, "Billing", "/billing"],
              [ShieldCheck, "Staff", "/staff"],
              [ClipboardList, "Reports", "/reports"],
            ].map(([Icon, label, path]) => (
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 font-medium ${
                    isActive ? "bg-emerald-50 text-[#1b7f35]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
                key={label}
                to={path}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mx-4 mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Kenya-ready workspace</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Tenant-scoped records, KES reporting, and payment tracking for local operations.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{user?.email || "Workspace"}</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Business Dashboard</h2>
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

          <div className="px-4 py-6 sm:px-6">
            <section className="mb-6 overflow-hidden rounded-lg bg-slate-950 text-white shadow-sm">
              <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">Today overview</p>
                  <h3 className="mt-3 text-3xl font-semibold leading-tight">
                    Keep Kenyan sales, stock, payments, and customers moving from one command center.
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Your dashboard reflects live PostgreSQL data and highlights the daily operational work your team needs to act on.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {quickActions.map(({ label, icon: Icon, path }) => (
                    <button
                      className="flex items-center justify-between rounded-md bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/15"
                      key={label}
                      onClick={() => navigate(path)}
                      type="button"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon size={18} />
                        {label}
                      </span>
                      <CheckCircle2 size={16} className="text-teal-300" />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {error && (
              <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                Loading dashboard...
              </div>
            ) : (
              <>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {metrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                      <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" key={metric.label}>
                        <div className={`h-1.5 ${metric.accent}`} />
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                              <p className="mt-3 text-2xl font-semibold text-slate-950">{metric.value}</p>
                            </div>
                            <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${metric.surface} ${metric.text}`}>
                              <Icon size={21} />
                            </div>
                          </div>
                          <p className="mt-4 text-xs font-medium text-slate-500">{metric.detail}</p>
                        </div>
                      </article>
                    );
                  })}
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                  <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-950">Inventory Levels</h3>
                        <p className="mt-1 text-sm text-slate-500">Stock quantity across your first six products.</p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {products.length} products
                      </span>
                    </div>

                    <div className="space-y-4">
                      {stockChart.length === 0 ? (
                        <p className="rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-500">No product stock to chart yet.</p>
                      ) : (
                        stockChart.map((item) => (
                          <div className="grid grid-cols-[112px_1fr_56px] items-center gap-3 text-sm sm:grid-cols-[160px_1fr_64px]" key={item.name}>
                            <span className="truncate font-medium text-slate-700">{item.name}</span>
                            <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-teal-700"
                                style={{ width: `${Math.max((item.quantity / maxStock) * 100, 5)}%` }}
                              />
                            </div>
                            <span className="text-right font-semibold text-slate-700">{item.quantity}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </article>

                  <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5">
                      <h3 className="font-semibold text-slate-950">Order Status</h3>
                      <p className="mt-1 text-sm text-slate-500">A quick sales pipeline view.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-4" key={status}>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{status}</p>
                          <p className="mt-2 text-2xl font-semibold text-slate-950">{count}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                      <div>
                        <h3 className="font-semibold text-slate-950">Recent Orders</h3>
                        <p className="mt-1 text-sm text-slate-500">Latest customer sales activity.</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-5 py-3 font-semibold">Order</th>
                            <th className="px-5 py-3 font-semibold">Customer</th>
                            <th className="px-5 py-3 font-semibold">Status</th>
                            <th className="px-5 py-3 font-semibold">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length === 0 ? (
                            <tr>
                              <td className="px-5 py-8 text-slate-500" colSpan="4">
                                No orders yet. Create a customer and product, then post your first order.
                              </td>
                            </tr>
                          ) : (
                            orders.slice(0, 6).map((order) => (
                              <tr className="border-t border-slate-100 hover:bg-slate-50" key={order.id}>
                                <td className="px-5 py-4 font-semibold text-slate-900">{order.order_number}</td>
                                <td className="px-5 py-4 text-slate-600">{order.customer_name}</td>
                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${
                                      statusStyles[order.status] || "bg-slate-50 text-slate-700 ring-slate-200"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4 font-semibold text-slate-700">{formatCurrency(order.total_amount)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </article>

                  <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                      <h3 className="font-semibold text-slate-950">Stock Watchlist</h3>
                      <p className="mt-1 text-sm text-slate-500">Products at or below reorder level.</p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {lowStockProducts.length === 0 ? (
                        <div className="px-5 py-8">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <CheckCircle2 size={22} />
                          </div>
                          <p className="mt-4 font-semibold text-slate-950">Stock levels look healthy</p>
                          <p className="mt-1 text-sm text-slate-500">No products have crossed their reorder level.</p>
                        </div>
                      ) : (
                        lowStockProducts.map((product) => (
                          <div className="flex items-center justify-between gap-4 px-5 py-4" key={product.id}>
                            <div>
                              <p className="font-semibold text-slate-900">{product.name}</p>
                              <p className="mt-1 text-sm text-slate-500">SKU {product.sku}</p>
                            </div>
                            <div className="rounded-md bg-rose-50 px-3 py-2 text-right">
                              <p className="font-semibold text-rose-700">{product.stock_quantity}</p>
                              <p className="text-xs text-rose-600">Reorder {product.reorder_level}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </article>
                </section>

                <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h3 className="font-semibold text-slate-950">Recent Customers</h3>
                    <p className="mt-1 text-sm text-slate-500">Newest customer records in this company workspace.</p>
                  </div>

                  <div className="grid gap-0 divide-y divide-slate-100 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                    {customers.length === 0 ? (
                      <p className="px-5 py-8 text-sm text-slate-500">No customers yet.</p>
                    ) : (
                      customers.slice(0, 6).map((customer) => (
                        <div className="px-5 py-4" key={customer.id}>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 font-semibold text-slate-700">
                              {customer.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{customer.name}</p>
                              <p className="truncate text-sm text-slate-500">{customer.email || "No email"}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
