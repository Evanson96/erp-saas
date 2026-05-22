import { History } from "lucide-react";
import { useEffect, useState } from "react";
import ModuleLayout from "../components/ModuleLayout";
import api from "../services/api";

function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const response = await api.get("/api/audit-logs");
        setAuditLogs(response.data.auditLogs || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load audit logs.");
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, []);

  return (
    <ModuleLayout
      description="Review important staff actions and operational changes across the company workspace."
      eyebrow="Governance"
      title="Audit Logs"
    >
      <section className="rounded-lg bg-slate-950 p-6 text-white shadow-sm">
        <History className="text-teal-300" size={28} />
        <h3 className="mt-4 text-2xl font-semibold">{auditLogs.length} tracked events</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Audit logs help admins trace key actions like product changes, payments, stock receiving, staff updates, and customer changes.
        </p>
      </section>

      {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-950">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">Actor</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Entity</th>
                <th className="px-5 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="5">Loading audit logs...</td></tr>
              ) : auditLogs.length === 0 ? (
                <tr><td className="px-5 py-8 text-slate-500" colSpan="5">No audit logs yet. Perform actions like creating products or recording payments.</td></tr>
              ) : (
                auditLogs.map((log) => (
                  <tr className="border-t border-slate-100 hover:bg-slate-50" key={log.id}>
                    <td className="px-5 py-4 text-slate-600">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{log.actor_email || log.actor_type}</p>
                      <p className="text-xs text-slate-500">{log.actor_type}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{log.action}</td>
                    <td className="px-5 py-4 text-slate-600">{log.entity_type} #{log.entity_id || "-"}</td>
                    <td className="max-w-sm truncate px-5 py-4 text-slate-500">
                      {log.details ? JSON.stringify(log.details) : "-"}
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

export default AuditLogs;
