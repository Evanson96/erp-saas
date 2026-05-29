import {
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  CreditCard,
  Headphones,
  Mail,
  MapPin,
  ReceiptText,
  ShoppingBag,
  Smartphone,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const modules = [
  ["Inventory", "Manage SKUs, reorder levels, branches, and fast-moving stock.", Boxes],
  ["Sales Orders", "Create orders for walk-in, wholesale, field sales, and online customers.", ReceiptText],
  ["Purchasing", "Track suppliers, purchase orders, receiving, and landed stock costs.", Truck],
  ["Customer Portal", "Let customers register, browse products, and place orders from their phones.", ShoppingBag],
  ["Billing", "Invoices, payments, balances, receipts, and KES reporting in one flow.", CreditCard],
  ["Reports", "See top products, best customers, collections, low stock, and revenue.", BarChart3],
];

const sectors = [
  "Retail shops",
  "Distributors",
  "Wholesalers",
  "Agrovet suppliers",
  "Beauty and cosmetics",
  "Hardware stores",
  "Service businesses",
  "Online sellers",
];

const proofPoints = [
  "Multi-company data separation",
  "PostgreSQL production database",
  "JWT authentication and bcrypt passwords",
  "M-Pesa-ready payment workflow",
  "Railway backend and Vercel frontend deployment",
  "Audit logs for critical business actions",
];

function Home() {
  const [lead, setLead] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    team_size: "1-10",
    message: "",
  });
  const [leadStatus, setLeadStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitLead = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setLeadStatus("");
      const response = await api.post("/api/leads", lead);
      setLeadStatus(response.data.message || "Demo request received.");
      setLead({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        team_size: "1-10",
        message: "",
      });
    } catch (error) {
      setLeadStatus(error.response?.data?.message || "Failed to send request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f2f6f3] text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img
          alt="Kenyan business team managing inventory and sales"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          src="/images/kenya-erp-hero.png"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/82 to-slate-950/25" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-between px-6 py-8">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1eb53a] text-white shadow-sm">
                <BarChart3 size={22} />
              </div>
              <div>
                <span className="block text-lg font-semibold">ERP SaaS Kenya</span>
                <span className="text-xs font-medium text-slate-300">Inventory. Sales. Customers. Payments.</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <a className="rounded-md px-3 py-2 text-slate-200 hover:bg-white/10" href="#modules">
                Modules
              </a>
              <a className="rounded-md px-3 py-2 text-slate-200 hover:bg-white/10" href="#industries">
                Industries
              </a>
              <a className="rounded-md px-3 py-2 text-slate-200 hover:bg-white/10" href="#demo">
                Book demo
              </a>
              <Link className="rounded-md px-3 py-2 text-slate-200 hover:bg-white/10" to="/login">
                Staff login
              </Link>
              <Link className="rounded-md bg-white px-4 py-2 text-slate-950 hover:bg-slate-100" to="/customer/login">
                Customer portal
              </Link>
            </div>
          </nav>

          <div className="grid items-end gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-white/10">
                <MapPin size={16} />
                Built for growing Kenyan businesses
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight sm:text-6xl">
                ERP software for Kenyan SMEs that sell, stock, deliver, and collect payments daily.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                Give your company one clean system for inventory, purchasing, sales, billing, customer orders,
                staff roles, and executive reports in KES.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center gap-2 rounded-md bg-[#1eb53a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#189632]"
                  to="/register"
                >
                  Create company <ArrowRight size={17} />
                </Link>
                <a
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15"
                  href="#demo"
                >
                  Request demo
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                [Building2, "Company workspace", "Separate data for every company and team"],
                [Smartphone, "M-Pesa-ready", "Record cash, bank, card, M-Pesa, and other payments"],
                [ShoppingBag, "Customer self-service", "Customers order online from your company portal"],
              ].map(([Icon, title, text]) => (
                <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-sm backdrop-blur" key={title}>
                  <Icon className="text-emerald-300" size={23} />
                  <p className="mt-3 font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr]" id="modules">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1b7f35]">Local business workflows</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">A practical ERP for shops, suppliers, distributors, and service teams.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The system supports the work Kenyan teams repeat every day: checking stock, selling to customers,
            receiving supplier goods, issuing invoices, recording payments, and following up on balances.
          </p>

          <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <img
              alt="Kenyan retail customer placing an order"
              className="h-72 w-full object-cover"
              src="/images/kenya-customer-ordering.png"
            />
            <div className="p-5">
              <h3 className="font-semibold text-slate-950">Customer ordering that feels familiar</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Customers can register into a company portal, browse products, and place orders from their phone.
                Staff then handle the order in the sales module.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {modules.map(([title, text, Icon]) => (
            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" key={title}>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-[#1b7f35]">
                <Icon size={22} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white" id="industries">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1b7f35]">Who it serves</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Made for companies that need control without complicated software.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              From Nairobi wholesalers to county-based retailers, the UI is built around fast daily operations,
              simple records, KES values, and customer follow-up.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {sectors.map((sector) => (
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3" key={sector}>
                <CheckCircle2 className="shrink-0 text-[#1b7f35]" size={20} />
                <span className="text-sm font-medium text-slate-700">{sector}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <img
            alt="Kenyan operations team reviewing ERP analytics"
            className="h-full min-h-80 w-full object-cover"
            src="/images/kenya-analytics.png"
          />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1b7f35]">Production posture</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Ready for real company demos, pilots, and deployment hardening.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This system already has the important bones of a SaaS product: secure auth, tenant-scoped data, CI,
            deployed frontend/backend, managed PostgreSQL, email hooks, and audit logs.
          </p>
          <div className="mt-6 grid gap-3">
            {proofPoints.map((point) => (
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm" key={point}>
                <CheckCircle2 className="shrink-0 text-[#1b7f35]" size={20} />
                <span className="text-sm font-medium text-slate-700">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr]" id="demo">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1b7f35]">Book a walkthrough</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Let interested companies request a demo from the site.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Demo requests are saved in PostgreSQL. When SMTP is configured, your sales inbox can receive the request immediately.
          </p>
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <Headphones className="text-[#1b7f35]" size={22} />
            <div>
              <p className="font-semibold text-slate-950">Sales-ready workflow</p>
              <p className="text-sm text-slate-500">Capture company details before onboarding them into the ERP.</p>
            </div>
          </div>
        </div>

        <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submitLead}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Company name
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1b7f35] focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setLead((current) => ({ ...current, company_name: event.target.value }))}
                required
                value={lead.company_name}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Contact name
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1b7f35] focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setLead((current) => ({ ...current, contact_name: event.target.value }))}
                required
                value={lead.contact_name}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Work email
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1b7f35] focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setLead((current) => ({ ...current, email: event.target.value }))}
                required
                type="email"
                value={lead.email}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Phone
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1b7f35] focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setLead((current) => ({ ...current, phone: event.target.value }))}
                placeholder="+254..."
                value={lead.phone}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Team size
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1b7f35] focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setLead((current) => ({ ...current, team_size: event.target.value }))}
                value={lead.team_size}
              >
                <option>1-10</option>
                <option>11-50</option>
                <option>51-200</option>
                <option>200+</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              What do you want to manage?
              <textarea
                className="mt-1 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1b7f35] focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setLead((current) => ({ ...current, message: event.target.value }))}
                placeholder="Example: stock, invoices, customers, sales reps, supplier orders, M-Pesa payments..."
                value={lead.message}
              />
            </label>
          </div>

          {leadStatus && (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {leadStatus}
            </div>
          )}

          <button
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            <Mail size={16} />
            {submitting ? "Sending..." : "Request demo"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Home;
