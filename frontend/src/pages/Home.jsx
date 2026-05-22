import { ArrowRight, BarChart3, Building2, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="min-h-screen bg-[#eef3f7] text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img
          alt="ERP operations workspace"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=80"
        />
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-between px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500 text-slate-950">
                <BarChart3 size={22} />
              </div>
              <span className="text-lg font-semibold">ERP SaaS</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <Link className="rounded-md px-3 py-2 text-slate-200 hover:bg-white/10" to="/login">Staff login</Link>
              <Link className="rounded-md bg-white px-4 py-2 text-slate-950 hover:bg-slate-100" to="/customer/login">Customer portal</Link>
            </div>
          </nav>

          <div className="grid items-end gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">Multi-tenant ERP SaaS</p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight sm:text-6xl">
                A cleaner way to run inventory, customers, sales, and customer ordering.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">
                Companies manage operations in the ERP dashboard. Customers register into a company portal, browse products, and place orders without calling your staff.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="inline-flex items-center gap-2 rounded-md bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-teal-300" to="/register">
                  Create company <ArrowRight size={17} />
                </Link>
                <Link className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15" to="/customer/register">
                  Register as customer
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  [Building2, "Company workspace", "Tenant-safe ERP operations"],
                  [Users, "Customer portal", "Self-service registration"],
                  [ShoppingBag, "Online orders", "Orders flow into sales"],
                ].map(([Icon, title, text]) => (
                  <div className="rounded-md bg-white/10 p-4" key={title}>
                    <Icon className="text-teal-300" size={22} />
                    <p className="mt-3 font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
