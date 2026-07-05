import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAppSelector } from "../../app/hooks";

interface AdminDashboard {
  role: "Admin";
  totalEmployees: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

interface EmployeeDashboard {
  role: "Employee";
  myTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

type DashboardData = AdminDashboard | EmployeeDashboard;

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) => (
  <div className="bg-panel border border-border rounded-2xl p-5 relative overflow-hidden">
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} aria-hidden />
    <p className="text-sm text-muted">{label}</p>
    <p className="font-display text-3xl font-semibold text-ink mt-2">{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get("/dashboard");
        setData(res.data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Welcome back, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="text-muted text-sm mt-1">
          {user?.role === "Admin"
            ? "Here's how the team is tracking today."
            : "Here's where your work stands today."}
        </p>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading dashboard…</p>
      ) : data?.role === "Admin" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Employees" value={data.totalEmployees} accent="bg-brand" />
          <StatCard label="Total Tasks" value={data.totalTasks} accent="bg-ink" />
          <StatCard label="Completed Tasks" value={data.completedTasks} accent="bg-priority-low" />
          <StatCard label="Pending Tasks" value={data.pendingTasks} accent="bg-priority-medium" />
        </div>
      ) : data?.role === "Employee" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="My Tasks" value={data.myTasks} accent="bg-brand" />
          <StatCard label="Completed" value={data.completedTasks} accent="bg-priority-low" />
          <StatCard label="Pending" value={data.pendingTasks} accent="bg-priority-medium" />
          <StatCard label="Overdue" value={data.overdueTasks} accent="bg-priority-high" />
        </div>
      ) : (
        <p className="text-muted text-sm">No dashboard data available.</p>
      )}
    </div>
  );
};

export default Dashboard;
