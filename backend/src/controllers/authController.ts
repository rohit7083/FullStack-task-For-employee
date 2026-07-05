import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, Employee } from "../models";
import { generateToken } from "../utils/jwt";
import { isValidEmail, isValidPassword, passwordRequirementsMessage } from "../utils/validators";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, confirmPassword, role } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !role) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    if (!["Admin", "Employee"].includes(role)) {
      res.status(400).json({ message: "Role must be either Admin or Employee." });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ message: "Please provide a valid email address." });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: "Password and confirm password do not match." });
      return;
    }

    if (!isValidPassword(password)) {
      res.status(400).json({ message: passwordRequirementsMessage });
      return;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    // If registering as an Employee, auto-create a linked employee profile
    if (role === "Employee") {
      await Employee.create({
        name: fullName,
        email,
        department: "",
        designation: "",
        userId: user.id,
      });
    }

    const token = generateToken({ id: user.id, role: user.role, email: user.email });

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Registration failed." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const token = generateToken(
      { id: user.id, role: user.role, email: user.email },
      Boolean(rememberMe)
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Login failed." });
  }
};

// Logout is handled client-side by discarding the token; this endpoint exists
// for symmetry / potential token-blacklisting in the future.
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Logged out successfully." });
};
