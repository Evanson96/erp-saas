import {
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  CreditCard,
  Headphones,
  LockKeyhole,
  Mail,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const modules = [
  ["Inventory", "Products, stock levels, reorder alerts, and inventory valuation.", Boxes],
  ["Sales", "Customer records, orders, order statuses, invoices, and payments.", ReceiptText],
  ["Purchasing", "Suppliers, purchase orders, receiving stock, and cost visibility.", Truck],
  ["Customer Portal", "Customers register, browse products, and place orders online.", ShoppingBag],
  ["Staff Control", "Role-based access for managers, sales, inventory, and accounts.", ShieldCheck],
  ["Reports", "Executive reporting for revenue, collections, products, and customers.", BarChart3],
];

const proofPoints = [
  "Multi-company data separation",
  "PostgreSQL production database",
  "JWT authentication and bcrypt passwords",
  "Email-ready order and invoice notifications",
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
    <main className="min-h-screen bg-[#eef3f7] text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img
          alt="ERP warehouse and operations workspace"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=80"
        />
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-between px-6 py-8">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
                <BarChart3 size={22} />
              </div>
              <span className="text-lg font-semibold">ERP SaaS</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <a className="rounded-md px-3 py-2 text-slate-200 hover:bg-white/10" href="#modules">
                Modules
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

          <div className="grid items-end gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-teal-200 ring-1 ring-white/10">
                <LockKeyhole size={16} />
                Multi-tenant ERP SaaS for growing companies
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight sm:text-6xl">
                ERP SaaS
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                A production-ready operations platform where companies manage inventory, purchasing, sales, billing,
                customers, staff permissions, reports, and online customer orders.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center gap-2 rounded-md bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-teal-300"
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
                [Building2, "Company workspace", "Separate company data and teams"],
                [Users, "Customer self-service", "Registration, product browsing, and orders"],
                [CreditCard, "Finance ready", "Invoices, payments, balances, and exports"],
              ].map(([Icon, title, text]) => (
                <div className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur" key={title}>
                  <Icon className="text-teal-300" size={23} />
                  <p className="mt-3 font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16" id="modules">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Complete operating suite</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Built for the daily work companies pay for.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The first screen after login is not a brochure. It is a working ERP with live data, role permissions,
            customer ordering, and reporting already connected to PostgreSQL.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(([title, text, Icon]) => (
            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" key={title}>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <Icon size={22} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Production posture</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Ready for real company demos, pilots, and deployment hardening.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This system already has the important bones of a SaaS product: secure auth, tenant-scoped data, CI,
              deployed frontend/backend, and a managed PostgreSQL path.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {proofPoints.map((point) => (
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3" key={point}>
                <CheckCircle2 className="shrink-0 text-teal-700" size={20} />
                <span className="text-sm font-medium text-slate-700">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr]" id="demo">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Book a walkthrough</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Let interested companies request a demo from the site.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Demo requests are saved in PostgreSQL. When SMTP is configured, your sales inbox can receive the request immediately.
          </p>
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <Headphones className="text-teal-700" size={22} />
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
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) => setLead((current) => ({ ...current, company_name: event.target.value }))}
                required
                value={lead.company_name}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Contact name
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) => setLead((current) => ({ ...current, contact_name: event.target.value }))}
                required
                value={lead.contact_name}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Work email
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) => setLead((current) => ({ ...current, email: event.target.value }))}
                required
                type="email"
                value={lead.email}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Phone
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) => setLead((current) => ({ ...current, phone: event.target.value }))}
                value={lead.phone}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Team size
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
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
                className="mt-1 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                onChange={(event) => setLead((current) => ({ ...current, message: event.target.value }))}
                value={lead.message}
              />
            </label>
          </div>

          {leadStatus && (
            <div className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800">
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
