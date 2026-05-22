import { ArrowLeft, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const response = await api.get(`/api/billing/invoices/${id}`);
        setInvoice(response.data.invoice);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load invoice.");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  if (loading) {
    return <main className="min-h-screen bg-slate-100 p-8 text-sm text-slate-600">Loading invoice...</main>;
  }

  if (error || !invoice) {
    return <main className="min-h-screen bg-slate-100 p-8 text-sm text-red-700">{error || "Invoice not found."}</main>;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-4xl items-center justify-between print:hidden">
        <Link className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" to="/billing">
          <ArrowLeft size={16} /> Back to billing
        </Link>
        <button className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800" onClick={() => window.print()} type="button">
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>

      <section className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-sm print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Invoice</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">{invoice.invoice_number}</h1>
            <p className="mt-2 text-sm capitalize text-slate-500">Status: {invoice.status}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-slate-950">{invoice.company_name}</h2>
            <p className="mt-1 text-sm text-slate-500">{invoice.company_email}</p>
            <p className="text-sm text-slate-500">{invoice.company_phone || ""}</p>
            <p className="text-sm text-slate-500">{invoice.company_address || ""}</p>
          </div>
        </header>

        <section className="grid gap-6 border-b border-slate-200 py-8 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bill To</p>
            <h3 className="mt-2 font-semibold text-slate-950">{invoice.customer_name}</h3>
            <p className="mt-1 text-sm text-slate-500">{invoice.customer_email || ""}</p>
            <p className="text-sm text-slate-500">{invoice.customer_phone || ""}</p>
            <p className="text-sm text-slate-500">{invoice.customer_address || ""}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Issued</p>
            <p className="mt-2 text-sm text-slate-700">{new Date(invoice.issued_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</p>
            <p className="mt-2 text-sm text-slate-700">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "Not set"}</p>
          </div>
        </section>

        <section className="py-8">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 font-semibold">Item</th>
                <th className="py-3 text-right font-semibold">Qty</th>
                <th className="py-3 text-right font-semibold">Unit Price</th>
                <th className="py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr className="border-b border-slate-100" key={item.id}>
                  <td className="py-4">
                    <p className="font-semibold text-slate-900">{item.product_name}</p>
                    <p className="text-xs text-slate-500">{item.sku}</p>
                  </td>
                  <td className="py-4 text-right text-slate-700">{item.quantity}</td>
                  <td className="py-4 text-right text-slate-700">KES {Number(item.unit_price).toLocaleString()}</td>
                  <td className="py-4 text-right font-semibold text-slate-900">KES {Number(item.line_total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="ml-auto max-w-sm space-y-3 border-t border-slate-200 pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total</span>
            <span className="font-semibold">KES {Number(invoice.total_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Paid</span>
            <span className="font-semibold text-emerald-700">KES {Number(invoice.paid_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-slate-950">Balance Due</span>
            <span className="font-semibold text-slate-950">KES {Number(invoice.balance_due).toLocaleString()}</span>
          </div>
        </section>

        <section className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="font-semibold text-slate-950">Payments</h3>
          {invoice.payments.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No payments recorded.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {invoice.payments.map((payment) => (
                <div className="flex justify-between text-sm" key={payment.id}>
                  <span className="text-slate-600">{payment.method} {payment.reference ? `- ${payment.reference}` : ""}</span>
                  <span className="font-semibold">KES {Number(payment.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default InvoiceDetail;
