import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

type ReportType = "completed" | "pending" | "employee-wise";

const reportTabs: { value: ReportType; label: string }[] = [
  { value: "pending", label: "Pending Tasks" },
  { value: "completed", label: "Completed Tasks" },
  { value: "employee-wise", label: "Employee-wise" },
];

const Reports = () => {
  const [type, setType] = useState<ReportType>("pending");
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/reports", { params: { type } });
        setRows(res.data.data);
      } catch (error) {
        console.error("Failed to load report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [type]);

  const handleExport = async (format: "csv" | "excel") => {
    const res = await axiosInstance.get(`/reports/export/${format}`, {
      params: { type },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-report.${format === "csv" ? "csv" : "xlsx"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Reports</h1>
        <p className="text-muted text-sm mt-1">
          Generate and export task reports for the whole team.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex gap-2">
          {reportTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setType(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === tab.value
                  ? "bg-brand text-white"
                  : "bg-panel border border-border text-ink hover:border-brand"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport("csv")}
            className="px-4 py-2 rounded-lg border border-border bg-panel text-ink text-sm font-medium hover:border-brand transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="px-4 py-2 rounded-lg border border-border bg-panel text-ink text-sm font-medium hover:border-brand transition-colors"
          >
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                {columns.map((col) => (
                  <th key={col} className="px-5 py-3 font-medium whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length || 1} className="px-5 py-8 text-center text-muted">
                    Loading report…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length || 1} className="px-5 py-8 text-center text-muted">
                    No data for this report.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0">
                    {columns.map((col) => (
                      <td key={col} className="px-5 py-3 text-ink whitespace-nowrap">
                        {String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
