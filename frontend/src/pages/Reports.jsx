import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Download,
  Filter,
  PackageSearch,
  ReceiptText,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ModuleLayout from "../components/ModuleLayout";
import api from "../services/api";

const currency = (amount) => `KES ${Number(amount || 0).toLocaleString()}`;

const numberValue = (value) => Number(value || 0);

const toCsv = (rows) => {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const values = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? "";
        return `"${String(value).replaceAll('"', '""')}"`;
      })
      .join(",")
  );

  return [headers.join(","), ...values].join("\n");
};

function Reports() {
  const [filters, setFilters] = useState({ date_from: "", date_to: "" });
  const [report, setReport] = useState({
    summary: {},
    salesByProduct: [],
    salesByCustomer: [],
    paymentMethods: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/reports/summary", {
        params: {
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
        },
      });

      setReport({
        summary: response.data.summary || {},
        salesByProduct: response.data.salesByProduct || [],
        salesByCustomer: response.data.salesByCustomer || [],
        paymentMethods: response.data.paymentMethods || [],
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxProductSales = useMemo(() => {
    return Math.max(...report.salesByProduct.map((item) => numberValue(item.sales_amount)), 1);
  }, [report.salesByProduct]);

  const maxCustomerSales = useMemo(() => {
    return Math.max(...report.salesByCustomer.map((item) => numberValue(item.sales_amount)), 1);
  }, [report.salesByCustomer]);

  const grossMarginProxy = numberValue(report.summary.total_sales) - numberValue(report.summary.purchase_value);

  const cards = [
    {
      label: "Total Sales",
      value: currency(report.summary.total_sales),
      detail: `${numberValue(report.summary.total_orders).toLocaleString()} orders`,
      icon: TrendingUp,
      accent: "bg-teal-600",
    },
    {
      label: "Cash Collected",
      value: currency(report.summary.paid_amount),
      detail: `${currency(report.summary.balance_due)} outstanding`,
      icon: Wallet,
      accent: "bg-emerald-600",
    },
    {
      label: "Inventory Value",
      value: currency(report.summary.inventory_value),
      detail: `${numberValue(report.summary.total_products).toLocaleString()} products`,
      icon: PackageSearch,
      accent: "bg-indigo-600",
    },
    {
      label: "Low Stock",
      value: numberValue(report.summary.low_stock_count).toLocaleString(),
      detail: "Products at reorder level",
      icon: AlertTriangle,
      accent: "bg-rose-500",
    },
  ];

  const exportReport = () => {
    const rows = [
      { metric: "Total Sales", value: report.summary.total_sales || 0 },
      { metric: "Paid Amount", value: report.summary.paid_amount || 0 },
      { metric: "Balance Due", value: report.summary.balance_due || 0 },
      { metric: "Purchase Value", value: report.summary.purchase_value || 0 },
      { metric: "Inventory Value", value: report.summary.inventory_value || 0 },
      { metric: "Low Stock Count", value: report.summary.low_stock_count || 0 },
    ];
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "erp-summary-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ModuleLayout
      description="Board-level metrics across sales, collections, inventory, purchases, and customer demand."
      eyebrow="Reports"
      title="Executive Reports"
    >
      <section className="mb-6 overflow-hidden rounded-lg bg-slate-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 xl:grid-cols-[1fr_440px]">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-teal-300">
              <BarChart3 size={16} />
              Live PostgreSQL reporting
            </p>
            <h3 className="mt-3 text-3xl font-semibold leading-tight">Know what is selling, what is owed, and what needs restocking.</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Reports are tenant-scoped from your login token, so every company sees only its own sales, inventory, customers, and payments.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/10 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-200">
                <span className="mb-1 flex items-center gap-2">
                  <CalendarDays size={15} />
                  From
                </span>
                <input
                  className="w-full rounded-md border border-white/10 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-300"
                  onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))}
                  type="date"
                  value={filters.date_from}
                />
              </label>
              <label className="text-sm font-medium text-slate-200">
                <span className="mb-1 flex items-center gap-2">
                  <CalendarDays size={15} />
                  To
                </span>
                <input
                  className="w-full rounded-md border border-white/10 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-300"
                  onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))}
                  type="date"
                  value={filters.date_to}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-md bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-300"
                onClick={loadReports}
                type="button"
              >
                <Filter size={16} />
                Apply filters
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                onClick={exportReport}
                type="button"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </section>

      {error && <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, detail, icon: Icon, accent }) => (
          <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" key={label}>
            <div className={`h-1.5 ${accent}`} />
            <div className="p-5">
              <Icon className="text-slate-700" size={24} />
              <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{loading ? "..." : value}</p>
              <p className="mt-2 text-xs font-medium text-slate-500">{detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-950">Top Products</h3>
              <p className="mt-1 text-sm text-slate-500">Products ranked by sales value in the selected period.</p>
            </div>
            <ReceiptText className="text-teal-700" size={22} />
          </div>

          <div className="space-y-4">
            {report.salesByProduct.length === 0 ? (
              <p className="rounded-md bg-slate-50 px-4 py-6 text-sm text-slate-500">No product sales found for this period.</p>
            ) : (
              report.salesByProduct.map((product) => (
                <div className="grid gap-2" key={`${product.sku}-${product.name}`}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="truncate font-semibold text-slate-800">{product.name}</span>
                    <span className="font-semibold text-slate-950">{currency(product.sales_amount)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-teal-700"
                      style={{ width: `${Math.max((numberValue(product.sales_amount) / maxProductSales) * 100, 4)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    SKU {product.sku || "N/A"} - {numberValue(product.quantity_sold).toLocaleString()} units sold
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-950">Financial Health</h3>
          <p className="mt-1 text-sm text-slate-500">Collections and purchase pressure.</p>

          <div className="mt-5 space-y-3">
            {[
              ["Invoiced", currency(report.summary.invoiced_amount)],
              ["Collected", currency(report.summary.paid_amount)],
              ["Outstanding", currency(report.summary.balance_due)],
              ["Purchases", currency(report.summary.purchase_value)],
              ["Sales less purchases", currency(grossMarginProxy)],
            ].map(([label, value]) => (
              <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm" key={label}>
                <span className="font-medium text-slate-600">{label}</span>
                <span className="font-semibold text-slate-950">{loading ? "..." : value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold text-slate-950">Best Customers</h3>
            <p className="mt-1 text-sm text-slate-500">Customer demand ranked by total order value.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Orders</th>
                  <th className="px-5 py-3 font-semibold">Sales</th>
                  <th className="px-5 py-3 font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {report.salesByCustomer.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-slate-500" colSpan="4">
                      No customer sales found for this period.
                    </td>
                  </tr>
                ) : (
                  report.salesByCustomer.map((customer) => (
                    <tr className="border-t border-slate-100" key={`${customer.email}-${customer.name}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 font-semibold text-slate-700">
                            <Users size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{customer.name}</p>
                            <p className="text-xs text-slate-500">{customer.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{customer.orders_count}</td>
                      <td className="px-5 py-4 font-semibold text-slate-950">{currency(customer.sales_amount)}</td>
                      <td className="px-5 py-4">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${Math.max((numberValue(customer.sales_amount) / maxCustomerSales) * 100, 5)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold text-slate-950">Payment Mix</h3>
            <p className="mt-1 text-sm text-slate-500">How customers are paying invoices.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {report.paymentMethods.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">No payments found for this period.</p>
            ) : (
              report.paymentMethods.map((method) => (
                <div className="flex items-center justify-between gap-4 px-5 py-4" key={method.method}>
                  <div>
                    <p className="font-semibold capitalize text-slate-900">{method.method}</p>
                    <p className="mt-1 text-sm text-slate-500">{method.payments_count} payments</p>
                  </div>
                  <p className="font-semibold text-slate-950">{currency(method.amount)}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </ModuleLayout>
  );
}

export default Reports;
