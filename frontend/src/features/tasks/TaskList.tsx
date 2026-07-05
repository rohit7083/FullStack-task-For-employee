import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchTasks, createTask, updateTask, deleteTask, Task } from "./taskSlice";
import { fetchEmployees } from "../employees/employeeSlice";
import TaskForm from "./TaskForm";
import Pagination from "../../components/Pagination";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const priorityRail: Record<string, string> = {
  Low: "bg-priority-low",
  Medium: "bg-priority-medium",
  High: "bg-priority-high",
};

const statusBadge: Record<string, string> = {
  Pending: "bg-status-pending/10 text-status-pending",
  "In Progress": "bg-status-progress/10 text-status-progress",
  Completed: "bg-status-completed/10 text-status-completed",
};

const TaskList = () => {
  const dispatch = useAppDispatch();
  const { tasks, page, totalPages, loading } = useAppSelector((s) => s.tasks);
  const { employees } = useAppSelector((s) => s.employees);
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = user?.role === "Admin";

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  useEffect(() => {
    dispatch(fetchTasks({ search, status, priority, page: currentPage, limit: 9 }));
  }, [dispatch, search, status, priority, currentPage]);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchEmployees({ limit: 1000 }));
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, priority]);

  const openAddModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await dispatch(updateTask({ id: editingTask.id, formData })).unwrap();
      } else {
        await dispatch(createTask(formData)).unwrap();
      }
      setModalOpen(false);
    } catch {
      // handled via slice error state if surfaced elsewhere
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteTask(deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Tasks</h1>
          <p className="text-muted text-sm mt-1">
            {isAdmin ? "All tasks across the team" : "Tasks assigned to you"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-medium text-sm transition-colors"
          >
            + New task
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <div className="bg-panel border border-border rounded-2xl px-5 py-12 text-center text-muted text-sm">
          No tasks found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="relative bg-panel border border-border rounded-2xl p-5 pl-6 overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${priorityRail[task.priority]}`} />

              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-ink leading-snug">{task.title}</h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${statusBadge[task.status]}`}
                >
                  {task.status}
                </span>
              </div>

              {task.description && (
                <p className="text-sm text-muted mt-2 line-clamp-2">{task.description}</p>
              )}

              <div className="text-xs text-muted mt-3 space-y-1">
                <p>
                  <span className="font-medium text-ink">Due:</span>{" "}
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
                {isAdmin && task.assignedEmployee && (
                  <p>
                    <span className="font-medium text-ink">Assigned to:</span>{" "}
                    {task.assignedEmployee.name}
                  </p>
                )}
                {task.fileOriginalName && task.filePath && (
                  <p>
                    <a
                      href={`${API_ORIGIN}/uploads/${task.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand hover:underline font-medium"
                    >
                      📎 {task.fileOriginalName}
                    </a>
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-4 pt-3 border-t border-border">
                <button
                  onClick={() => openEditModal(task)}
                  disabled={task.status === "Completed"}
                  className="text-sm text-brand font-medium hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  {task.status === "Completed" ? "Locked" : "Edit"}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setDeleteTarget(task)}
                    className="text-sm text-priority-high font-medium hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setCurrentPage} />

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
          <div className="bg-panel rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl font-semibold text-ink mb-4">
              {editingTask ? "Edit task" : "New task"}
            </h2>
            <TaskForm
              initialData={editingTask}
              employees={employees}
              isAdmin={isAdmin}
              onSubmit={handleSubmit}
              onCancel={() => setModalOpen(false)}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
          <div className="bg-panel rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-display text-lg font-semibold text-ink mb-2">Delete task?</h2>
            <p className="text-sm text-muted mb-5">
              This will permanently remove <strong>{deleteTarget.title}</strong>. This can't be
              undone.
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

export default TaskList;
