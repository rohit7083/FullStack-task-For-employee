import { Response } from "express";
import { Op } from "sequelize";
import { Task, Employee, Notification } from "../models";
import { AuthRequest } from "../middleware/auth";

// GET /api/tasks?search=&status=&priority=&sortBy=&sortOrder=&page=&limit=
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search = "",
      status,
      priority,
      sortBy = "createdAt",
      sortOrder = "DESC",
      page = "1",
      limit = "10",
    } = req.query as Record<string, string>;

    const allowedSortFields = ["title", "priority", "status", "startDate", "dueDate", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 10, 1);
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    // Employees only see their own tasks; admins see all
    if (req.user?.role === "Employee") {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee) {
        res.status(200).json({ tasks: [], total: 0, page: pageNum, totalPages: 0 });
        return;
      }
      whereClause.assignedEmployeeId = employee.id;
    }

    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }
    if (status) {
      whereClause.status = status;
    }
    if (priority) {
      whereClause.priority = priority;
    }

    const { rows, count } = await Task.findAndCountAll({
      where: whereClause,
      include: [{ model: Employee, as: "assignedEmployee", attributes: ["id", "name", "email", "department"] }],
      order: [[sortField, order]],
      limit: limitNum,
      offset,
    });

    res.status(200).json({
      tasks: rows,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch tasks." });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Employee, as: "assignedEmployee" }],
    });
    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    if (req.user?.role === "Employee") {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || task.assignedEmployeeId !== employee.id) {
        res.status(403).json({ message: "You can only view your own tasks." });
        return;
      }
    }

    res.status(200).json({ task });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch task." });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, priority, status, startDate, dueDate, assignedEmployeeId } = req.body;

    if (!title || !startDate || !dueDate || !assignedEmployeeId) {
      res.status(400).json({
        message: "Title, start date, due date, and assigned employee are required.",
      });
      return;
    }

    if (new Date(dueDate) < new Date(startDate)) {
      res.status(400).json({ message: "Due date must not be earlier than start date." });
      return;
    }

    const employee = await Employee.findByPk(assignedEmployeeId);
    if (!employee) {
      res.status(404).json({ message: "Assigned employee not found." });
      return;
    }

    const file = req.file;

    const task = await Task.create({
      title,
      description: description || "",
      priority: priority || "Medium",
      status: status || "Pending",
      startDate,
      dueDate,
      assignedEmployeeId,
      filePath: file ? file.filename : null,
      fileOriginalName: file ? file.originalname : null,
    });

    // Notify the assigned employee
    if (employee.userId) {
      await Notification.create({
        userId: employee.userId,
        taskId: task.id,
        message: `You have been assigned a new task: "${task.title}".`,
        type: "TASK_ASSIGNED",
      });
    }

    res.status(201).json({ message: "Task created successfully.", task });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create task." });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findByPk(req.params.id, { include: [{ model: Employee, as: "assignedEmployee" }] });
    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    if (req.user?.role === "Employee") {
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (!employee || task.assignedEmployeeId !== employee.id) {
        res.status(403).json({ message: "You can only update your own tasks." });
        return;
      }
    }

    // Business rule: completed tasks cannot be edited
    if (task.status === "Completed") {
      res.status(400).json({ message: "Completed tasks cannot be edited." });
      return;
    }

    const { title, description, priority, status, startDate, dueDate, assignedEmployeeId } = req.body;

    const nextStartDate = startDate || task.startDate;
    const nextDueDate = dueDate || task.dueDate;

    if (new Date(nextDueDate) < new Date(nextStartDate)) {
      res.status(400).json({ message: "Due date must not be earlier than start date." });
      return;
    }

    // task.status cannot already be "Completed" here (handled above), so any
    // transition to "Completed" is a fresh completion.
    const willBeCompleted = status === "Completed";

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.priority = priority ?? task.priority;
    task.status = status ?? task.status;
    task.startDate = nextStartDate;
    task.dueDate = nextDueDate;

    if (assignedEmployeeId && assignedEmployeeId !== task.assignedEmployeeId) {
      const newEmployee = await Employee.findByPk(assignedEmployeeId);
      if (!newEmployee) {
        res.status(404).json({ message: "Assigned employee not found." });
        return;
      }
      task.assignedEmployeeId = assignedEmployeeId;

      if (newEmployee.userId) {
        await Notification.create({
          userId: newEmployee.userId,
          taskId: task.id,
          message: `You have been assigned a task: "${task.title}".`,
          type: "TASK_ASSIGNED",
        });
      }
    }

    if (req.file) {
      task.filePath = req.file.filename;
      task.fileOriginalName = req.file.originalname;
    }

    await task.save();

    // Notify when task transitions to completed
    if (willBeCompleted) {
      const employee = await Employee.findByPk(task.assignedEmployeeId);
      if (employee?.userId) {
        await Notification.create({
          userId: employee.userId,
          taskId: task.id,
          message: `Task "${task.title}" was marked as complete.`,
          type: "TASK_COMPLETED",
        });
      }
    }

    res.status(200).json({ message: "Task updated successfully.", task });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update task." });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found." });
      return;
    }

    await task.destroy();
    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to delete task." });
  }
};
