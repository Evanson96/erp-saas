import { CreditCard, FileText, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ModuleLayout from "../components/ModuleLayout";
import api from "../services/api";

function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState({ order_id: "", due_date: "" });
  const [paymentForm, setPaymentForm] = useState({ invoice_id: "", amount: "", method: "cash", reference: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadBilling = async () => {
    try {
      const [invoicesResponse, paymentsResponse, ordersResponse] = await Promise.all([
        api.get("/api/billing/invoices"),
        api.get("/api/billing/payments"),
        api.get("/api/orders"),
      ]);

      setInvoices(invoicesResponse.data.invoices || []);
      setPayments(paymentsResponse.data.payments || []);
      setOrders(ordersResponse.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load billing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, []);

  const invoiceTotals = useMemo(() => {
    return invoices.reduce(
      (totals, invoice) => ({
        total: totals.total + Number(invoice.total_amount || 0),
        paid: totals.paid + Number(invoice.paid_amount || 0),
        balance: totals.balance + Number(invoice.balance_due || 0),
      }),
      { total: 0, paid: 0, balance: 0 }
    );
  }, [invoices]);

  const uninvoicedOrders = useMemo(() => {
    const invoicedOrderIds = new Set(invoices.map((invoice) => Number(invoice.order_id)));
    return orders.filter((order) => !invoicedOrderIds.has(Number(order.id)));
  }, [orders, invoices]);

  const openInvoices = useMemo(() => {
    return invoices.filter((invoice) => Number(invoice.balance_due) > 0 && invoice.status !== "void");
  }, [invoices]);

  const handleExportInvoices = () => {
    const headers = ["Invoice", "Customer", "Status", "Total", "Paid", "Balance", "Issued"];
    const rows = invoices.map((invoice) => [
      invoice.invoice_number,
      invoice.customer_name,
      invoice.status,
      invoice.total_amount,
      invoice.paid_amount,
      invoice.balance_due,
      invoice.issued_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "invoices.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.post("/api/billing/invoices", {
        order_id: Number(invoiceForm.order_id),
        due_date: invoiceForm.due_date || null,
      });
      setInvoiceForm({ order_id: "", due_date: "" });
      setSuccess("Invoice created successfully.");
      await loadBilling();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create invoice.");
    } finally {
      setSaving(false);
    }
  };

  const handleRecordPayment = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.post("/api/billing/payments", {
        invoice_id: Number(paymentForm.invoice_id),
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        reference: paymentForm.reference,
      });
      setPaymentForm({ invoice_id: "", amount: "", method: "cash", reference: "" });
      setSuccess("Payment recorded successfully.");
      await loadBilling();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleLayout
      description="Generate invoices from orders and record customer payments."
      eyebrow="Finance"
      title="Billing & Payments"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <FileText className="text-teal-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Invoiced</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">KES {invoiceTotals.total.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Wallet className="text-emerald-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Paid</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">KES {invoiceTotals.paid.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <CreditCard className="text-rose-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Outstanding</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">KES {invoiceTotals.balance.toLocaleString()}</p>
        </div>
      </section>

      {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleCreateInvoice}>
          <h3 className="font-semibold text-slate-950">Create Invoice</h3>
          <p className="mt-1 text-sm text-slate-500">Generate one invoice from an order.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <select className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="order_id" onChange={(event) => setInvoiceForm((current) => ({ ...current, order_id: event.target.value }))} required value={invoiceForm.order_id}>
              <option value="">Select uninvoiced order</option>
              {uninvoicedOrders.map((order) => (
                <option key={order.id} value={order.id}>{order.order_number} - {order.customer_name}</option>
              ))}
            </select>
            <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="due_date" onChange={(event) => setInvoiceForm((current) => ({ ...current, due_date: event.target.value }))} type="date" value={invoiceForm.due_date} />
          </div>
          <button className="mt-5 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400" disabled={saving || uninvoicedOrders.length === 0} type="submit">
            Create invoice
          </button>
        </form>

        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleRecordPayment}>
          <h3 className="font-semibold text-slate-950">Record Payment</h3>
          <p className="mt-1 text-sm text-slate-500">Apply a payment to an open invoice.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <select className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="invoice_id" onChange={(event) => setPaymentForm((current) => ({ ...current, invoice_id: event.target.value }))} required value={paymentForm.invoice_id}>
              <option value="">Select invoice</option>
              {openInvoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} - Balance KES {Number(invoice.balance_due).toLocaleString()}</option>
              ))}
            </select>
            <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" min="1" name="amount" onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount" required type="number" value={paymentForm.amount} />
            <select className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="method" onChange={(event) => setPaymentForm((current) => ({ ...current, method: event.target.value }))} required value={paymentForm.method}>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="mpesa">M-Pesa</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
            <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="reference" onChange={(event) => setPaymentForm((current) => ({ ...current, reference: event.target.value }))} placeholder="Reference" value={paymentForm.reference} />
          </div>
          <button className="mt-5 rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400" disabled={saving || openInvoices.length === 0} type="submit">
            Record payment
          </button>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-950">Invoices</h3>
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={handleExportInvoices} type="button">
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Invoice</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Paid</th>
                <th className="px-5 py-3 font-semibold">Balance</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="7">Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="7">No invoices yet.</td></tr>
              ) : (
                invoices.map((invoice) => (
                  <tr className="border-t border-slate-100 hover:bg-slate-50" key={invoice.id}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{invoice.invoice_number}</td>
                    <td className="px-5 py-4 text-slate-600">{invoice.customer_name}</td>
                    <td className="px-5 py-4 capitalize text-slate-600">{invoice.status}</td>
                    <td className="px-5 py-4 text-slate-600">KES {Number(invoice.total_amount).toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-600">KES {Number(invoice.paid_amount).toLocaleString()}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">KES {Number(invoice.balance_due).toLocaleString()}</td>
                    <td className="px-5 py-4 text-right">
                      <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" to={`/billing/invoices/${invoice.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-950">Recent Payments</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {payments.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">No payments recorded yet.</p>
          ) : (
            payments.slice(0, 8).map((payment) => (
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" key={payment.id}>
                <div>
                  <p className="font-semibold text-slate-900">{payment.invoice_number}</p>
                  <p className="text-sm text-slate-500">{payment.customer_name} - {payment.method}</p>
                </div>
                <p className="font-semibold text-emerald-700">KES {Number(payment.amount).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </ModuleLayout>
  );
}

export default Billing;
