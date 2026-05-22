import { LogOut, Package, ReceiptText, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { clearCustomerAuth, getCustomerAccount, getCustomerCompany } from "../utils/auth";

function CustomerPortal() {
  const navigate = useNavigate();
  const account = getCustomerAccount();
  const company = getCustomerCompany();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const loadPortal = async () => {
    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        api.get("/api/customer-portal/products"),
        api.get("/api/customer-portal/orders"),
      ]);
      setProducts(productsResponse.data.products || []);
      setOrders(ordersResponse.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customer portal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortal();
  }, []);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([productId, quantity]) => {
        const product = products.find((item) => item.id === Number(productId));
        return { ...product, quantity: Number(quantity) };
      })
      .filter((item) => item.id);
  }, [cart, products]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  }, [cartItems]);

  const handleQuantityChange = (productId, value) => {
    setCart((current) => ({ ...current, [productId]: value }));
  };

  const handlePlaceOrder = async () => {
    setError("");
    setSuccess("");
    setPlacing(true);

    try {
      await api.post("/api/customer-portal/orders", {
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      });
      setCart({});
      setSuccess("Order placed successfully. The company can now process it.");
      await loadPortal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  const handleLogout = () => {
    clearCustomerAuth();
    navigate("/customer/login");
  };

  return (
    <main className="min-h-screen bg-[#eef3f7] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-teal-700">{company?.name || "Customer portal"}</p>
            <h1 className="text-2xl font-semibold">Welcome, {account?.name || "Customer"}</h1>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={handleLogout} type="button">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-slate-950 p-5 text-white shadow-sm">
            <Package className="text-teal-300" size={24} />
            <p className="mt-4 text-sm text-slate-300">Available products</p>
            <p className="mt-2 text-3xl font-semibold">{products.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <ReceiptText className="text-indigo-700" size={24} />
            <p className="mt-4 text-sm text-slate-500">Your orders</p>
            <p className="mt-2 text-3xl font-semibold">{orders.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <ShoppingCart className="text-amber-600" size={24} />
            <p className="mt-4 text-sm text-slate-500">Cart total</p>
            <p className="mt-2 text-3xl font-semibold">KES {cartTotal.toLocaleString()}</p>
          </div>
        </section>

        {error && <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No products are available right now.</div>
            ) : (
              products.map((product) => (
                <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={product.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-950">{product.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{product.description || product.sku}</p>
                    </div>
                    <span className="rounded-md bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">KES {Number(product.price).toLocaleString()}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">{product.stock_quantity} in stock</p>
                    <input
                      className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      min="0"
                      max={product.stock_quantity}
                      onChange={(event) => handleQuantityChange(product.id, event.target.value)}
                      placeholder="Qty"
                      type="number"
                      value={cart[product.id] || ""}
                    />
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-950">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {cartItems.length === 0 ? (
                <p className="text-sm text-slate-500">Select quantities to build your order.</p>
              ) : (
                cartItems.map((item) => (
                  <div className="flex items-center justify-between gap-4 text-sm" key={item.id}>
                    <span className="text-slate-600">{item.name} x {item.quantity}</span>
                    <span className="font-semibold">KES {(Number(item.price) * item.quantity).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-semibold">KES {cartTotal.toLocaleString()}</span>
              </div>
              <button className="mt-5 w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400" disabled={placing || cartItems.length === 0} onClick={handlePlaceOrder} type="button">
                {placing ? "Placing order..." : "Place order"}
              </button>
            </div>
          </aside>
        </section>

        <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold">Your Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td className="px-5 py-6 text-slate-500" colSpan="4">No orders yet.</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr className="border-t border-slate-100" key={order.id}>
                      <td className="px-5 py-4 font-semibold">{order.order_number}</td>
                      <td className="px-5 py-4 capitalize text-slate-600">{order.status}</td>
                      <td className="px-5 py-4">KES {Number(order.total_amount).toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default CustomerPortal;
