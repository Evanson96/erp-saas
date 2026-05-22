import { Mail, Pencil, Phone, Trash2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import ModuleLayout from "../components/ModuleLayout";
import api from "../services/api";

const emptyCustomer = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState(emptyCustomer);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCustomers = async () => {
    try {
      const response = await api.get("/api/customers");
      setCustomers(response.data.customers || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyCustomer);
    setEditingCustomerId(null);
  };

  const handleEdit = (customer) => {
    setEditingCustomerId(customer.id);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm("Delete this customer? Customers with orders cannot be deleted.")) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/api/customers/${customerId}`);
      setSuccess("Customer deleted successfully.");
      await loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete customer.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (editingCustomerId) {
        await api.put(`/api/customers/${editingCustomerId}`, formData);
        setSuccess("Customer updated successfully.");
      } else {
        await api.post("/api/customers", formData);
        setSuccess("Customer added successfully.");
      }

      resetForm();
      await loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleLayout
      description="Manage customer accounts, contacts, and sales relationships."
      eyebrow="Customers"
      title="Customer Directory"
    >
      <section className="rounded-lg bg-slate-950 p-6 text-white shadow-sm">
        <Users size={28} className="text-teal-300" />
        <h3 className="mt-4 text-2xl font-semibold">{customers.length} customer accounts</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Customer records are isolated per company and connected to your sales orders.
        </p>
      </section>

      {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-950">{editingCustomerId ? "Edit Customer" : "Add Customer"}</h3>
            <p className="mt-1 text-sm text-slate-500">Create and maintain customer records for sales orders.</p>
          </div>
          {editingCustomerId && (
            <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetForm} type="button">
              <X size={16} /> Cancel
            </button>
          )}
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {[
            ["name", "Customer name", "text", true],
            ["email", "Email", "email", false],
            ["phone", "Phone", "text", false],
            ["address", "Address", "text", false],
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
          <div className="md:col-span-2">
            <button className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400" disabled={saving} type="submit">
              {saving ? "Saving..." : editingCustomerId ? "Update customer" : "Add customer"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No customers yet.</div>
        ) : (
          customers.map((customer) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={customer.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 font-semibold text-teal-800">
                    {customer.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-950">{customer.name}</h3>
                    <p className="text-sm text-slate-500">Customer #{customer.id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100" onClick={() => handleEdit(customer)} title="Edit customer" type="button">
                    <Pencil size={15} />
                  </button>
                  <button className="rounded-md border border-rose-200 p-2 text-rose-700 hover:bg-rose-50" onClick={() => handleDelete(customer.id)} title="Delete customer" type="button">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p className="flex items-center gap-2"><Mail size={16} />{customer.email || "No email"}</p>
                <p className="flex items-center gap-2"><Phone size={16} />{customer.phone || "No phone"}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </ModuleLayout>
  );
}

export default Customers;
