import { PackageCheck, Truck, Warehouse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ModuleLayout from "../components/ModuleLayout";
import api from "../services/api";

function Purchasing() {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierForm, setSupplierForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [poForm, setPoForm] = useState({ supplier_id: "", product_id: "", quantity: "1", unit_cost: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receivingId, setReceivingId] = useState(null);

  const loadPurchasing = async () => {
    try {
      const [suppliersResponse, purchaseOrdersResponse, productsResponse] = await Promise.all([
        api.get("/api/purchases/suppliers"),
        api.get("/api/purchases/purchase-orders"),
        api.get("/api/products"),
      ]);
      setSuppliers(suppliersResponse.data.suppliers || []);
      setPurchaseOrders(purchaseOrdersResponse.data.purchaseOrders || []);
      setProducts(productsResponse.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load purchasing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchasing();
  }, []);

  const orderedValue = useMemo(() => {
    return purchaseOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  }, [purchaseOrders]);

  const pendingOrders = useMemo(() => {
    return purchaseOrders.filter((order) => order.status === "ordered").length;
  }, [purchaseOrders]);

  const handleSupplierChange = (event) => {
    setSupplierForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handlePoChange = (event) => {
    setPoForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleCreateSupplier = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.post("/api/purchases/suppliers", supplierForm);
      setSupplierForm({ name: "", email: "", phone: "", address: "" });
      setSuccess("Supplier created successfully.");
      await loadPurchasing();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create supplier.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePurchaseOrder = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.post("/api/purchases/purchase-orders", {
        supplier_id: Number(poForm.supplier_id),
        items: [
          {
            product_id: Number(poForm.product_id),
            quantity: Number(poForm.quantity),
            unit_cost: Number(poForm.unit_cost),
          },
        ],
      });
      setPoForm({ supplier_id: "", product_id: "", quantity: "1", unit_cost: "" });
      setSuccess("Purchase order created successfully.");
      await loadPurchasing();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create purchase order.");
    } finally {
      setSaving(false);
    }
  };

  const handleReceive = async (purchaseOrderId) => {
    setError("");
    setSuccess("");
    setReceivingId(purchaseOrderId);

    try {
      await api.patch(`/api/purchases/purchase-orders/${purchaseOrderId}/receive`);
      setSuccess("Purchase order received. Inventory stock has been updated.");
      await loadPurchasing();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to receive purchase order.");
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <ModuleLayout
      description="Create suppliers, raise purchase orders, and receive stock into inventory."
      eyebrow="Purchasing"
      title="Suppliers & Purchase Orders"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Truck className="text-teal-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Suppliers</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{suppliers.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <PackageCheck className="text-indigo-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Pending POs</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{pendingOrders}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Warehouse className="text-emerald-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Ordered value</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">KES {orderedValue.toLocaleString()}</p>
        </div>
      </section>

      {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleCreateSupplier}>
          <h3 className="font-semibold text-slate-950">Add Supplier</h3>
          <p className="mt-1 text-sm text-slate-500">Create suppliers that purchase orders can be raised against.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="name" onChange={handleSupplierChange} placeholder="Supplier name" required value={supplierForm.name} />
            <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="email" onChange={handleSupplierChange} placeholder="Email" type="email" value={supplierForm.email} />
            <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="phone" onChange={handleSupplierChange} placeholder="Phone" value={supplierForm.phone} />
            <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="address" onChange={handleSupplierChange} placeholder="Address" value={supplierForm.address} />
          </div>
          <button className="mt-5 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400" disabled={saving} type="submit">
            Add supplier
          </button>
        </form>

        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleCreatePurchaseOrder}>
          <h3 className="font-semibold text-slate-950">Create Purchase Order</h3>
          <p className="mt-1 text-sm text-slate-500">Create a purchase order. Receiving it will increase product stock.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <select className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="supplier_id" onChange={handlePoChange} required value={poForm.supplier_id}>
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
            <select className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="product_id" onChange={handlePoChange} required value={poForm.product_id}>
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" min="1" name="quantity" onChange={handlePoChange} placeholder="Quantity" required type="number" value={poForm.quantity} />
            <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" min="0" name="unit_cost" onChange={handlePoChange} placeholder="Unit cost" required type="number" value={poForm.unit_cost} />
          </div>
          <button className="mt-5 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400" disabled={saving || suppliers.length === 0 || products.length === 0} type="submit">
            Create purchase order
          </button>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-950">Purchase Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">PO Number</th>
                <th className="px-5 py-3 font-semibold">Supplier</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="5">Loading purchase orders...</td></tr>
              ) : purchaseOrders.length === 0 ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="5">No purchase orders yet.</td></tr>
              ) : (
                purchaseOrders.map((order) => (
                  <tr className="border-t border-slate-100 hover:bg-slate-50" key={order.id}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{order.purchase_order_number}</td>
                    <td className="px-5 py-4 text-slate-600">{order.supplier_name}</td>
                    <td className="px-5 py-4 capitalize text-slate-600">{order.status}</td>
                    <td className="px-5 py-4 font-semibold text-slate-700">KES {Number(order.total_amount).toLocaleString()}</td>
                    <td className="px-5 py-4 text-right">
                      <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400" disabled={order.status === "received" || order.status === "cancelled" || receivingId === order.id} onClick={() => handleReceive(order.id)} type="button">
                        {receivingId === order.id ? "Receiving..." : order.status === "received" ? "Received" : "Receive Stock"}
                      </button>
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

export default Purchasing;
