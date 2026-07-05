import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "Pending" | "In Progress" | "Completed";

interface TaskAttributes {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: Date;
  dueDate: Date;
  assignedEmployeeId: number;
  filePath: string | null;
  fileOriginalName: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type TaskCreationAttributes = Optional<
  TaskAttributes,
  "id" | "filePath" | "fileOriginalName"
>;

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public priority!: TaskPriority;
  public status!: TaskStatus;
  public startDate!: Date;
  public dueDate!: Date;
  public assignedEmployeeId!: number;
  public filePath!: string | null;
  public fileOriginalName!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      allowNull: false,
      defaultValue: "Medium",
    },
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed"),
      allowNull: false,
      defaultValue: "Pending",
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    assignedEmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileOriginalName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "tasks",
    timestamps: true,
  }
);

export default Task;
