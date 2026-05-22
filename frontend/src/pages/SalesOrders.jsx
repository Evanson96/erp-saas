import { ReceiptText, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ModuleLayout from "../components/ModuleLayout";
import api from "../services/api";

function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: "",
    product_id: "",
    quantity: "1",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadSalesData = async () => {
    try {
      const [ordersResponse, customersResponse, productsResponse] = await Promise.all([
        api.get("/api/orders"),
        api.get("/api/customers"),
        api.get("/api/products"),
      ]);

      setOrders(ordersResponse.data.orders || []);
      setCustomers(customersResponse.data.customers || []);
      setProducts(productsResponse.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load sales orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.post("/api/orders", {
        customer_id: Number(formData.customer_id),
        items: [
          {
            product_id: Number(formData.product_id),
            quantity: Number(formData.quantity),
          },
        ],
      });

      setFormData({
        customer_id: "",
        product_id: "",
        quantity: "1",
      });
      setSuccess("Order created successfully.");
      await loadSalesData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    setError("");
    setSuccess("");
    setUpdatingOrderId(orderId);

    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      setSuccess("Order status updated successfully.");
      await loadSalesData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const totalSales = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0), [orders]);

  return (
    <ModuleLayout
      description="Review customer orders, status, and sales totals."
      eyebrow="Sales"
      title="Sales Orders"
    >
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ShoppingCart className="text-teal-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Orders</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ReceiptText className="text-indigo-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Sales total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">KES {totalSales.toLocaleString()}</p>
        </div>
      </section>

      {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h3 className="font-semibold text-slate-950">Create Sales Order</h3>
          <p className="mt-1 text-sm text-slate-500">Select a customer, product, and quantity. Stock will reduce automatically.</p>
        </div>

        <form className="grid gap-4 md:grid-cols-4" onSubmit={handleSubmit}>
          <select className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 md:col-span-2" name="customer_id" onChange={handleChange} required value={formData.customer_id}>
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="product_id" onChange={handleChange} required value={formData.product_id}>
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name} ({product.stock_quantity})</option>
            ))}
          </select>
          <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" min="1" name="quantity" onChange={handleChange} placeholder="Qty" required type="number" value={formData.quantity} />
          <div className="md:col-span-4">
            <button className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400" disabled={saving || customers.length === 0 || products.length === 0} type="submit">
              {saving ? "Creating..." : "Create order"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-950">Order Register</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Order No.</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="5">Loading sales orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="5">No orders yet.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr className="border-t border-slate-100 hover:bg-slate-50" key={order.id}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{order.order_number}</td>
                    <td className="px-5 py-4 text-slate-600">{order.customer_name}</td>
                    <td className="px-5 py-4 capitalize text-slate-600">{order.status}</td>
                    <td className="px-5 py-4 font-semibold text-slate-700">KES {Number(order.total_amount).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                        disabled={updatingOrderId === order.id}
                        onChange={(event) => handleStatusChange(order.id, event.target.value)}
                        value={order.status}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ModuleLayout>
  );
}

export default SalesOrders;
