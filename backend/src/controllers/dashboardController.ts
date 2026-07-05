import { Response } from "express";
import { Op } from "sequelize";
import { Task, Employee } from "../models";
import { AuthRequest } from "../middleware/auth";

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role === "Admin") {
      const [totalEmployees, totalTasks, completedTasks, pendingTasks] = await Promise.all([
        Employee.count(),
        Task.count(),
        Task.count({ where: { status: "Completed" } }),
        Task.count({ where: { status: { [Op.in]: ["Pending", "In Progress"] } } }),
      ]);

      res.status(200).json({
        role: "Admin",
        totalEmployees,
        totalTasks,
        completedTasks,
        pendingTasks,
      });
      return;
    }

    // Employee view
    const employee = await Employee.findOne({ where: { userId: req.user?.id } });
    if (!employee) {
      res.status(200).json({
        role: "Employee",
        myTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const [myTasks, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
      Task.count({ where: { assignedEmployeeId: employee.id } }),
      Task.count({ where: { assignedEmployeeId: employee.id, status: "Completed" } }),
      Task.count({
        where: { assignedEmployeeId: employee.id, status: { [Op.in]: ["Pending", "In Progress"] } },
      }),
      Task.count({
        where: {
          assignedEmployeeId: employee.id,
          status: { [Op.ne]: "Completed" },
          dueDate: { [Op.lt]: today },
        },
      }),
    ]);

    res.status(200).json({
      role: "Employee",
      myTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load dashboard." });
  }
};
