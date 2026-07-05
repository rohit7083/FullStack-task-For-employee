import { Response } from "express";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import { Employee, User } from "../models";
import { AuthRequest } from "../middleware/auth";
import { isValidEmail } from "../utils/validators";

// GET /api/employees?search=&sortBy=&sortOrder=&page=&limit=
export const getEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search = "",
      sortBy = "createdAt",
      sortOrder = "DESC",
      page = "1",
      limit = "10",
    } = req.query as Record<string, string>;

    const allowedSortFields = ["name", "email", "department", "designation", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 10, 1);
    const offset = (pageNum - 1) * limitNum;

    const whereClause = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { department: { [Op.like]: `%${search}%` } },
            { designation: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { rows, count } = await Employee.findAndCountAll({
      where: whereClause,
      order: [[sortField, order]],
      limit: limitNum,
      offset,
    });

    res.status(200).json({
      employees: rows,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch employees." });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      res.status(404).json({ message: "Employee not found." });
      return;
    }
    res.status(200).json({ employee });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch employee." });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, department, designation, createLogin, password } = req.body;

    if (!name || !email) {
      res.status(400).json({ message: "Name and email are required." });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ message: "Please provide a valid email address." });
      return;
    }

    const existing = await Employee.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "An employee with this email already exists." });
      return;
    }

    let userId: number | null = null;

    // Optionally create a login account for this employee at the same time
    if (createLogin) {
      if (!password) {
        res.status(400).json({ message: "A password is required to create a login account." });
        return;
      }
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({ message: "A user account with this email already exists." });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        fullName: name,
        email,
        password: hashedPassword,
        role: "Employee",
      });
      userId = user.id;
    }

    const employee = await Employee.create({
      name,
      email,
      department: department || "",
      designation: designation || "",
      userId,
    });

    res.status(201).json({ message: "Employee added successfully.", employee });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create employee." });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      res.status(404).json({ message: "Employee not found." });
      return;
    }

    const { name, email, department, designation } = req.body;

    if (email && !isValidEmail(email)) {
      res.status(400).json({ message: "Please provide a valid email address." });
      return;
    }

    employee.name = name ?? employee.name;
    employee.email = email ?? employee.email;
    employee.department = department ?? employee.department;
    employee.designation = designation ?? employee.designation;

    await employee.save();

    res.status(200).json({ message: "Employee updated successfully.", employee });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update employee." });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      res.status(404).json({ message: "Employee not found." });
      return;
    }

    await employee.destroy();
    res.status(200).json({ message: "Employee deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to delete employee." });
  }
};
