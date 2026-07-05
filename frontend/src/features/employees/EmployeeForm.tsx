import { FormEvent, useState } from "react";
import { Employee } from "./employeeSlice";

interface EmployeeFormProps {
  initialData?: Employee | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

const EmployeeForm = ({ initialData, onSubmit, onCancel, submitting }: EmployeeFormProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [designation, setDesignation] = useState(initialData?.designation || "");
  const [createLogin, setCreateLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isEdit = Boolean(initialData);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    if (!isEdit && createLogin && !password) {
      setError("A password is required to create a login account.");
      return;
    }

    const payload: any = { name, email, department, designation };
    if (!isEdit && createLogin) {
      payload.createLogin = true;
      payload.password = password;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-priority-high bg-priority-high/10 border border-priority-high/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Department</label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Designation</label>
          <input
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
          />
        </div>
      </div>

      {!isEdit && (
        <div className="border-t border-border pt-4">
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={createLogin}
              onChange={(e) => setCreateLogin(e.target.checked)}
              className="rounded border-border text-brand focus:ring-brand/40"
            />
            Also create a login account for this employee
          </label>

          {createLogin && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-ink mb-1.5">Temporary password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                placeholder="At least 8 characters"
              />
            </div>
          )}
        </div>
      )}

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
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Add employee"}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
