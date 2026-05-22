import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import api from "../services/api";
import { saveAuth } from "../utils/auth";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    userName: "",
    userEmail: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/register-company", formData);
      saveAuth({
        token: response.data.token,
        user: response.data.user,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      description="Create a company workspace and invite your team into a tenant-separated ERP environment."
      eyebrow="Create workspace"
      title="Register your company"
    >
        {error && (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="companyName">
              Company name
            </label>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="companyName"
              name="companyName"
              onChange={handleChange}
              required
              type="text"
              value={formData.companyName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="companyEmail">
              Company email
            </label>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="companyEmail"
              name="companyEmail"
              onChange={handleChange}
              type="email"
              value={formData.companyEmail}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="userName">
              Admin name
            </label>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="userName"
              name="userName"
              onChange={handleChange}
              required
              type="text"
              value={formData.userName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="userEmail">
              Admin email
            </label>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="userEmail"
              name="userEmail"
              onChange={handleChange}
              required
              type="email"
              value={formData.userEmail}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="password"
              minLength="6"
              name="password"
              onChange={handleChange}
              required
              type="password"
              value={formData.password}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="companyPhone">
              Phone
            </label>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="companyPhone"
              name="companyPhone"
              onChange={handleChange}
              type="text"
              value={formData.companyPhone}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="companyAddress">
              Address
            </label>
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="companyAddress"
              name="companyAddress"
              onChange={handleChange}
              value={formData.companyAddress}
            />
          </div>

          <div className="flex items-center justify-between gap-4 md:col-span-2">
            <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" to="/login">
              Back to login
            </Link>
            <button
              className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={loading}
              type="submit"
            >
              {loading ? "Registering..." : "Register company"}
            </button>
          </div>
        </form>
    </AuthShell>
  );
}

export default Register;
