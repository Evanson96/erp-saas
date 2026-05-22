import { BarChart3, Boxes, ReceiptText, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ModuleLayout from "../components/ModuleLayout";
import api from "../services/api";

function Reports() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [productsResponse, customersResponse, ordersResponse] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/customers"),
          api.get("/api/orders"),
        ]);
        setProducts(productsResponse.data.products || []);
        setCustomers(customersResponse.data.customers || []);
        setOrders(ordersResponse.data.orders || []);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0), [orders]);
  const stockUnits = useMemo(() => products.reduce((sum, product) => sum + Number(product.stock_quantity || 0), 0), [products]);

  const cards = [
    { label: "Revenue", value: `KES ${revenue.toLocaleString()}`, icon: BarChart3 },
    { label: "Stock Units", value: stockUnits.toLocaleString(), icon: Boxes },
    { label: "Customers", value: customers.length, icon: Users },
    { label: "Orders", value: orders.length, icon: ReceiptText },
  ];

  return (
    <ModuleLayout
      description="High-level reporting across sales, inventory, and customers."
      eyebrow="Reports"
      title="Business Reports"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={label}>
            <Icon className="text-teal-700" size={24} />
            <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{loading ? "..." : value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-950">Report Notes</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          These reports are calculated from live ERP data. In the next phase, this section can become exportable CSV/PDF reports,
          date filters, and visual charts.
        </p>
      </section>
    </ModuleLayout>
  );
}

export default Reports;
