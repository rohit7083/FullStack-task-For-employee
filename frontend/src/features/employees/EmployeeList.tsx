import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  Employee,
} from "./employeeSlice";
import EmployeeForm from "./EmployeeForm";
import Pagination from "../../components/Pagination";

const sortOptions = [
  { value: "createdAt", label: "Date added" },
  { value: "name", label: "Name" },
  { value: "department", label: "Department" },
  { value: "designation", label: "Designation" },
];

const EmployeeList = () => {
  const dispatch = useAppDispatch();
  const { employees, total, page, totalPages, loading } = useAppSelector((s) => s.employees);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  useEffect(() => {
    dispatch(fetchEmployees({ search, sortBy, sortOrder, page: currentPage, limit: 10 }));
  }, [dispatch, search, sortBy, sortOrder, currentPage]);

  // Reset to page 1 on filter/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, sortOrder]);

  const openAddModal = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingEmployee) {
        await dispatch(updateEmployee({ id: editingEmployee.id, ...data })).unwrap();
      } else {
        await dispatch(createEmployee(data)).unwrap();
      }
      setModalOpen(false);
    } catch {
      // error is already surfaced via redux state if needed
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteEmployee(deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Employees</h1>
          <p className="text-muted text-sm mt-1">{total} total</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-medium text-sm transition-colors"
        >
          + Add employee
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search employees…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSortOrder((o) => (o === "ASC" ? "DESC" : "ASC"))}
          className="px-4 py-2.5 rounded-lg border border-border bg-white text-ink text-sm hover:border-brand transition-colors"
        >
          {sortOrder === "ASC" ? "↑ Asc" : "↓ Desc"}
        </button>
      </div>

      <div className="bg-panel border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Designation</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    Loading employees…
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{employee.name}</td>
                    <td className="px-5 py-3 text-muted">{employee.email}</td>
                    <td className="px-5 py-3 text-ink">{employee.department || "—"}</td>
                    <td className="px-5 py-3 text-ink">{employee.designation || "—"}</td>
                    <td className="px-5 py-3 text-right space-x-3">
                      <button
                        onClick={() => openEditModal(employee)}
                        className="text-brand font-medium hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(employee)}
                        className="text-priority-high font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
          <div className="bg-panel rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl font-semibold text-ink mb-4">
              {editingEmployee ? "Edit employee" : "Add employee"}
            </h2>
            <EmployeeForm
              initialData={editingEmployee}
              onSubmit={handleSubmit}
              onCancel={() => setModalOpen(false)}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
          <div className="bg-panel rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-display text-lg font-semibold text-ink mb-2">Delete employee?</h2>
            <p className="text-sm text-muted mb-5">
              This will permanently remove <strong>{deleteTarget.name}</strong> from your employee
              list. This can't be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-ink font-medium hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-priority-high hover:opacity-90 text-white font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
