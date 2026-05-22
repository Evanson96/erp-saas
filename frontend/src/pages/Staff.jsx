import { ShieldCheck, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ModuleLayout from "../components/ModuleLayout";
import api from "../services/api";

const emptyStaff = {
  name: "",
  email: "",
  password: "",
  role_id: "",
};

function Staff() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(emptyStaff);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadStaff = async () => {
    try {
      const [rolesResponse, usersResponse] = await Promise.all([
        api.get("/api/staff/roles"),
        api.get("/api/staff/users"),
      ]);
      setRoles(rolesResponse.data.roles || []);
      setUsers(usersResponse.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load staff data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const activeUsers = useMemo(() => users.filter((user) => user.is_active).length, [users]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleCreateStaff = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.post("/api/staff/users", {
        ...formData,
        role_id: Number(formData.role_id),
      });
      setFormData(emptyStaff);
      setSuccess("Staff user created successfully.");
      await loadStaff();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create staff user.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async (user, updates) => {
    setError("");
    setSuccess("");

    try {
      await api.put(`/api/staff/users/${user.id}`, {
        name: updates.name ?? user.name,
        role_id: Number(updates.role_id ?? user.role_id),
        is_active: updates.is_active ?? user.is_active,
      });
      setSuccess("Staff user updated successfully.");
      await loadStaff();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update staff user.");
    }
  };

  return (
    <ModuleLayout
      description="Invite staff, assign roles, and control access to operational modules."
      eyebrow="Access Control"
      title="Staff & Roles"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Users className="text-teal-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Staff users</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{users.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ShieldCheck className="text-indigo-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Roles</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{roles.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <UserPlus className="text-emerald-700" size={24} />
          <p className="mt-4 text-sm font-medium text-slate-500">Active users</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{activeUsers}</p>
        </div>
      </section>

      {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-950">Create Staff User</h3>
        <p className="mt-1 text-sm text-slate-500">Only Admin users can create and manage staff accounts.</p>
        <form className="mt-5 grid gap-4 md:grid-cols-4" onSubmit={handleCreateStaff}>
          <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="name" onChange={handleChange} placeholder="Full name" required value={formData.name} />
          <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="email" onChange={handleChange} placeholder="Email" required type="email" value={formData.email} />
          <input className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="password" onChange={handleChange} placeholder="Temporary password" required type="password" value={formData.password} />
          <select className="rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" name="role_id" onChange={handleChange} required value={formData.role_id}>
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <div className="md:col-span-4">
            <button className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-400" disabled={saving} type="submit">
              {saving ? "Creating..." : "Create staff user"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-950">Staff Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Update</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="5">Loading staff...</td></tr>
              ) : users.length === 0 ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="5">No staff users yet.</td></tr>
              ) : (
                users.map((user) => (
                  <tr className="border-t border-slate-100 hover:bg-slate-50" key={user.id}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{user.name}</td>
                    <td className="px-5 py-4 text-slate-600">{user.email}</td>
                    <td className="px-5 py-4">
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                        onChange={(event) => handleUpdateUser(user, { role_id: event.target.value })}
                        value={user.role_id || ""}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${user.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        onClick={() => handleUpdateUser(user, { is_active: !user.is_active })}
                        type="button"
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ModuleLayout>
  );
}

export default Staff;
