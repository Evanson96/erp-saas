import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import api from "../services/api";
import { saveCustomerAuth } from "../utils/auth";

function CustomerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ companyEmail: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/customer-portal/login", formData);
      saveCustomerAuth({
        token: response.data.token,
        account: response.data.account,
        company: response.data.company,
      });
      navigate("/customer/portal");
    } catch (err) {
      setError(err.response?.data?.message || "Customer login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      description="Customers can access a company storefront, browse available products, and place orders."
      eyebrow="Customer portal"
      title="Customer sign in"
    >
      {error && <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <input className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="companyEmail" onChange={handleChange} placeholder="Company email, e.g. admin@acme.com" required type="email" value={formData.companyEmail} />
        <input className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="email" onChange={handleChange} placeholder="Your email" required type="email" value={formData.email} />
        <input className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="password" onChange={handleChange} placeholder="Password" required type="password" value={formData.password} />
        <button className="w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Open customer portal"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        New customer? <Link className="font-semibold text-teal-700" to="/customer/register">Register here</Link>
      </p>
    </AuthShell>
  );
}

export default CustomerLogin;
