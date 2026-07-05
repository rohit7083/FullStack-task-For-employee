import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import EmployeeList from "./features/employees/EmployeeList";
import TaskList from "./features/tasks/TaskList";
import Reports from "./features/reports/Reports";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAppSelector } from "./app/hooks";

const App = () => {
  const { token } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<Navbar />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskList />} />

          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

export default App;
