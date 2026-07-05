import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface EmployeeAttributes {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  userId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type EmployeeCreationAttributes = Optional<EmployeeAttributes, "id" | "userId">;

class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public department!: string;
  public designation!: string;
  public userId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "employees",
    timestamps: true,
  }
);

export default Employee;
