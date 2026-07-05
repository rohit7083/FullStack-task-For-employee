import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

export type NotificationType = "TASK_ASSIGNED" | "TASK_DUE_SOON" | "TASK_COMPLETED";

interface NotificationAttributes {
  id: number;
  userId: number;
  taskId: number | null;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type NotificationCreationAttributes = Optional<NotificationAttributes, "id" | "isRead" | "taskId">;

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public userId!: number;
  public taskId!: number | null;
  public message!: string;
  public type!: NotificationType;
  public isRead!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("TASK_ASSIGNED", "TASK_DUE_SOON", "TASK_COMPLETED"),
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: true,
  }
);

export default Notification;
