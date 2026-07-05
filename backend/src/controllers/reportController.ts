import ExcelJS from "exceljs";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Employee, Task } from "../models";

type ReportType = "completed" | "pending" | "employee-wise";

// Simple CSV converter — avoids external type-declaration issues entirely
const convertToCSV = (data: Record<string, any>[]): string => {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const escapeValue = (value: any): string => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const headerRow = headers.join(",");
  const dataRows = data.map((row) => headers.map((h) => escapeValue(row[h])).join(","));
  return [headerRow, ...dataRows].join("\n");
};

const buildReportRows = async (type: ReportType) => {
  if (type === "completed" || type === "pending") {
    const status = type === "completed" ? "Completed" : ["Pending", "In Progress"];
    const tasks = await Task.findAll({
      where: type === "completed" ? { status: "Completed" } : { status },
      include: [{ model: Employee, as: "assignedEmployee", attributes: ["name", "email", "department"] }],
      order: [["dueDate", "ASC"]],
    });

    return tasks.map((t: any) => ({
      Title: t.title,
      Priority: t.priority,
      Status: t.status,
      StartDate: t.startDate,
      DueDate: t.dueDate,
      AssignedEmployee: t.assignedEmployee?.name || "Unassigned",
      Department: t.assignedEmployee?.department || "",
    }));
  }

  // employee-wise summary
  const employees = await Employee.findAll({ include: [{ model: Task, as: "tasks" }] });
  return employees.map((e: any) => {
    const tasks = e.tasks || [];
    const completed = tasks.filter((t: any) => t.status === "Completed").length;
    const pending = tasks.filter((t: any) => t.status !== "Completed").length;
    return {
      Employee: e.name,
      Email: e.email,
      Department: e.department,
      TotalTasks: tasks.length,
      Completed: completed,
      Pending: pending,
    };
  });
};

export const getReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const type = (req.query.type as ReportType) || "pending";
    if (!["completed", "pending", "employee-wise"].includes(type)) {
      res.status(400).json({ message: "Invalid report type." });
      return;
    }
    const data = await buildReportRows(type);
    res.status(200).json({ type, data });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to generate report." });
  }
};

export const exportReportCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const type = (req.query.type as ReportType) || "pending";
    if (!["completed", "pending", "employee-wise"].includes(type)) {
      res.status(400).json({ message: "Invalid report type." });
      return;
    }

    const data = await buildReportRows(type);

    if (data.length === 0) {
      res.status(200).send("No data available for this report.");
      return;
    }

    const csv = convertToCSV(data);

    res.header("Content-Type", "text/csv");
    res.attachment(`${type}-report.csv`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to export CSV report." });
  }
};

export const exportReportExcel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const type = (req.query.type as ReportType) || "pending";
    if (!["completed", "pending", "employee-wise"].includes(type)) {
      res.status(400).json({ message: "Invalid report type." });
      return;
    }

    const data = await buildReportRows(type);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(type);

    if (data.length > 0) {
      sheet.columns = Object.keys(data[0]).map((key) => ({
        header: key,
        key,
        width: 22,
      }));
      sheet.addRows(data);
      sheet.getRow(1).font = { bold: true };
    } else {
      sheet.addRow(["No data available for this report."]);
    }

    res.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.attachment(`${type}-report.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to export Excel report." });
  }
};