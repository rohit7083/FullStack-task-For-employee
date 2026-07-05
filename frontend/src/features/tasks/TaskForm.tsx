import { FormEvent, useState } from "react";
import { Task, TaskPriority, TaskStatus } from "./taskSlice";
import { Employee } from "../employees/employeeSlice";

interface TaskFormProps {
  initialData?: Task | null;
  employees: Employee[];
  isAdmin: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

const MAX_FILE_MB = 5;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const TaskForm = ({ initialData, employees, isAdmin, onSubmit, onCancel, submitting }: TaskFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || "Medium");
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || "Pending");
  const [startDate, setStartDate] = useState(initialData?.startDate?.slice(0, 10) || "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate?.slice(0, 10) || "");
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(
    initialData?.assignedEmployeeId ? String(initialData.assignedEmployeeId) : ""
  );
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const isEdit = Boolean(initialData);
  const isCompleted = initialData?.status === "Completed";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Only PDF, JPG, and PNG files are allowed.");
      e.target.value = "";
      return;
    }
    if (selected.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File must be ${MAX_FILE_MB} MB or smaller.`);
      e.target.value = "";
      return;
    }
    setError("");
    setFile(selected);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !startDate || !dueDate || (isAdmin && !assignedEmployeeId)) {
      setError("Title, start date, due date, and assigned employee are required.");
      return;
    }

    if (new Date(dueDate) < new Date(startDate)) {
      setError("Due date must not be earlier than start date.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("priority", priority);
    formData.append("status", status);
    formData.append("startDate", startDate);
    formData.append("dueDate", dueDate);
    if (assignedEmployeeId) formData.append("assignedEmployeeId", assignedEmployeeId);
    if (file) formData.append("file", file);

    await onSubmit(formData);
  };

  if (isEdit && isCompleted) {
    return (
      <div className="text-sm text-muted bg-paper border border-border rounded-lg px-4 py-6 text-center">
        Completed tasks can't be edited.
        <div className="mt-4">
          <button
            onClick={onCancel}
            type="button"
            className="px-4 py-2 rounded-lg border border-border text-ink font-medium hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-priority-high bg-priority-high/10 border border-priority-high/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Start date</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Due date</label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      </div>

      {isAdmin && (
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Assigned employee</label>
          <select
            required
            value={assignedEmployeeId}
            onChange={(e) => setAssignedEmployeeId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="">Select an employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} — {emp.department || "No department"}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Attachment <span className="text-muted font-normal">(PDF, JPG, PNG — max 5 MB)</span>
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="w-full text-sm text-ink file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-brand-light file:text-brand file:font-medium file:cursor-pointer"
        />
        {initialData?.fileOriginalName && !file && (
          <p className="text-xs text-muted mt-1.5">Current file: {initialData.fileOriginalName}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-lg border border-border text-ink font-medium hover:bg-paper transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-medium transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
