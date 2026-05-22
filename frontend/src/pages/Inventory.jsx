import { AlertTriangle, Boxes, Pencil, PackagePlus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ModuleLayout from "../components/ModuleLayout";
import api from "../services/api";

const emptyProduct = {
  name: "",
  sku: "",
  description: "",
  price: "",
  stock_quantity: "",
  reorder_level: "",
};

function Inventory() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      const response = await api.get("/api/products");
      setProducts(response.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyProduct);
    setEditingProductId(null);
  };

  const handleEdit = (product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      price: product.price || "",
      stock_quantity: product.stock_quantity || "",
      reorder_level: product.reorder_level || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product? Products used in orders cannot be deleted.")) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/api/products/${productId}`);
      setSuccess("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const payload = {
      ...formData,
      price: Number(formData.price || 0),
      stock_quantity: Number(formData.stock_quantity || 0),
      reorder_level: Number(formData.reorder_level || 0),
    };

    try {
      if (editingProductId) {
        await api.put(`/api/products/${editingProductId}`, payload);
        setSuccess("Product updated successfully.");
      } else {
        await api.post("/api/products", payload);
        setSuccess("Product added successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const lowStock = useMemo(() => {
    return products.filter((product) => Number(product.stock_quantity) <= Number(product.reorder_level));
  }, [products]);

  const inventoryValue = useMemo(() => {
    return products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stock_quantity || 0), 0);
  }, [products]);

  return (
    <ModuleLayout
      description="Track stock, pricing, reorder levels, and product availability."
      eyebrow="Inventory"
      title="Inventory Management"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Boxes className="text-teal-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Products</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{products.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <AlertTriangle className="text-rose-600" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Low stock</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{lowStock.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <PackagePlus className="text-indigo-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Inventory value</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">KES {inventoryValue.toLocaleString()}</p>
        </div>
      </section>

      {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-950">{editingProductId ? "Edit Product" : "Add Product"}</h3>
            <p className="mt-1 text-sm text-slate-500">Create and maintain inventory items with SKU, price, stock, and reorder level.</p>
          </div>
          {editingProductId && (
            <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetForm} type="button">
              <X size={16} /> Cancel
            </button>
          )}
        </div>

        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          {[
            ["name", "Product name", "text", true],
            ["sku", "SKU", "text", true],
            ["price", "Price", "number", false],
            ["stock_quantity", "Stock quantity", "number", false],
            ["reorder_level", "Reorder level", "number", false],
            ["description", "Description", "text", false],
          ].map(([name, placeholder, type, required]) => (
            <input
              className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              key={name}
              name={name}
              onChange={handleChange}
              placeholder={placeholder}
              required={required}
              type={type}
              value={formData[name]}
            />
          ))}
          <div className="md:col-span-3">
            <button className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400" disabled={saving} type="submit">
              {saving ? "Saving..." : editingProductId ? "Update product" : "Add product"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-950">Product List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">SKU</th>
                <th className="px-5 py-3 font-semibold">Price</th>
                <th className="px-5 py-3 font-semibold">Stock</th>
                <th className="px-5 py-3 font-semibold">Reorder</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="6">Loading inventory...</td></tr>
              ) : products.length === 0 ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="6">No products yet.</td></tr>
              ) : (
                products.map((product) => (
                  <tr className="border-t border-slate-100 hover:bg-slate-50" key={product.id}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{product.name}</td>
                    <td className="px-5 py-4 text-slate-600">{product.sku}</td>
                    <td className="px-5 py-4 text-slate-600">KES {Number(product.price).toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-600">{product.stock_quantity}</td>
                    <td className="px-5 py-4 text-slate-600">{product.reorder_level}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100" onClick={() => handleEdit(product)} title="Edit product" type="button">
                          <Pencil size={16} />
                        </button>
                        <button className="rounded-md border border-rose-200 p-2 text-rose-700 hover:bg-rose-50" onClick={() => handleDelete(product.id)} title="Delete product" type="button">
                          <Trash2 size={16} />
                        </button>
                      </div>
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

export default Inventory;
