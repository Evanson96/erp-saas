function AuthShell({ children, eyebrow, title, description }) {
  return (
    <main className="min-h-screen bg-[#eef3f7]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-40">
            <img
              alt="Kenyan SME warehouse operations dashboard"
              className="h-full w-full object-cover"
              src="/images/kenya-erp-hero.png"
            />
          </div>
          <div className="absolute inset-0 bg-slate-950/75" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Built for Kenyan SMEs
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight text-white">
              Run stock, sales, billing, and customer orders from one secure workspace.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-200">
              Designed for distributors, retailers, wholesalers, service teams, and growing businesses across Kenya.
            </p>
          </div>

          <div className="relative z-10 rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Today</p>
                <p className="text-lg font-semibold text-white">Operations snapshot</p>
              </div>
              <span className="rounded-md bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-200">
                Live
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Orders", "128"],
                ["Stock value", "KES 4.8M"],
                ["Customers", "342"],
              ].map(([label, value]) => (
                <div className="rounded-md bg-white/10 p-4" key={label}>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-300">{label}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {[
                ["Inventory synced", "91%"],
                ["Orders fulfilled", "76%"],
                ["KES payments posted", "64%"],
              ].map(([label, value]) => (
                <div className="grid grid-cols-[132px_1fr_44px] items-center gap-3 text-sm" key={label}>
                  <span className="text-slate-300">{label}</span>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-emerald-300" style={{ width: value }} />
                  </div>
                  <span className="text-right font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-xl">
            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{eyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">{title}</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">{description}</p>
            </div>
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">{children}</section>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthShell;
