import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import api from "../services/api";
import { saveCustomerAuth } from "../utils/auth";

function CustomerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyEmail: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
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
      const response = await api.post("/api/customer-portal/register", formData);
      saveCustomerAuth({
        token: response.data.token,
        account: response.data.account,
        company: response.data.company,
      });
      navigate("/customer/portal");
    } catch (err) {
      setError(err.response?.data?.message || "Customer registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      description="Use the company email given by the business you buy from. Your account will be linked to that company only."
      eyebrow="Customer access"
      title="Register as a customer"
    >
      {error && <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 md:col-span-2" name="companyEmail" onChange={handleChange} placeholder="Company email, e.g. admin@acme.com" required type="email" value={formData.companyEmail} />
        <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="name" onChange={handleChange} placeholder="Your full name" required value={formData.name} />
        <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="email" onChange={handleChange} placeholder="Your email" required type="email" value={formData.email} />
        <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="phone" onChange={handleChange} placeholder="Phone" value={formData.phone} />
        <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="password" onChange={handleChange} placeholder="Password" required type="password" value={formData.password} />
        <textarea className="min-h-24 rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 md:col-span-2" name="address" onChange={handleChange} placeholder="Delivery address" value={formData.address} />
        <button className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400 md:col-span-2" disabled={loading} type="submit">
          {loading ? "Creating account..." : "Create customer account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered? <Link className="font-semibold text-teal-700" to="/customer/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}

export default CustomerRegister;
