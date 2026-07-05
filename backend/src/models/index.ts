import User from "./User";
import Employee from "./Employee";
import Task from "./Task";
import Notification from "./Notification";

// User <-> Employee (one-to-one, an employee's login account)
User.hasOne(Employee, { foreignKey: "userId", as: "employeeProfile" });
Employee.belongsTo(User, { foreignKey: "userId", as: "user" });

// Employee <-> Task (one employee has many tasks assigned)
Employee.hasMany(Task, { foreignKey: "assignedEmployeeId", as: "tasks" });
Task.belongsTo(Employee, { foreignKey: "assignedEmployeeId", as: "assignedEmployee" });

// User <-> Notification
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

Task.hasMany(Notification, { foreignKey: "taskId", as: "notifications" });
Notification.belongsTo(Task, { foreignKey: "taskId", as: "task" });

export { User, Employee, Task, Notification };
