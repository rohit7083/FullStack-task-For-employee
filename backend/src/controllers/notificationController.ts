import { Response } from "express";
import { Op } from "sequelize";
import { Notification, Task } from "../models";
import { AuthRequest } from "../middleware/auth";

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user!.id },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    // Compute "due within 1 day" notifications on the fly for the employee's own tasks
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    let dueSoonTasks: any[] = [];
    if (req.user?.role === "Employee") {
      const { Employee } = await import("../models");
      const employee = await Employee.findOne({ where: { userId: req.user.id } });
      if (employee) {
        dueSoonTasks = await Task.findAll({
          where: {
            assignedEmployeeId: employee.id,
            status: { [Op.ne]: "Completed" },
            dueDate: { [Op.between]: [todayStr, tomorrowStr] },
          },
        });
      }
    }

    const dueSoonAsNotifications = dueSoonTasks.map((t) => ({
      id: `virtual-due-${t.id}`,
      userId: req.user!.id,
      taskId: t.id,
      message: `Task "${t.title}" is due within 1 day.`,
      type: "TASK_DUE_SOON",
      isRead: false,
      createdAt: new Date(),
    }));

    res.status(200).json({ notifications: [...dueSoonAsNotifications, ...notifications] });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch notifications." });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!notification) {
      res.status(404).json({ message: "Notification not found." });
      return;
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: "Notification marked as read." });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update notification." });
  }
};
