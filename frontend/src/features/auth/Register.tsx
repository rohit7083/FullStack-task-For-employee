import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { register, UserRole } from "../auth/authSlice";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Employee");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (password !== confirmPassword) {
      setFormError("Password and confirm password do not match.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setFormError(
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number."
      );
      return;
    }

    const result = await dispatch(
      register({ fullName, email, password, confirmPassword, role })
    );
    if (register.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-brand mb-2">
            TaskFlow
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink">Create your account</h1>
          <p className="text-muted text-sm mt-2">Set up access to the task manager.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-panel border border-border rounded-2xl p-6 space-y-4 shadow-sm"
        >
          {(formError || error) && (
            <div className="text-sm text-priority-high bg-priority-high/10 border border-priority-high/20 rounded-lg px-3 py-2">
              {formError || error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-ink mb-1.5">
              Full name
            </label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-ink mb-1.5">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
            >
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              placeholder="••••••••"
            />
            <p className="text-xs text-muted mt-1.5">
              At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-1.5">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-ink outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
