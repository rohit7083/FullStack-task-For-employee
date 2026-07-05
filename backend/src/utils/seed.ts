import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { connectDB, sequelize } from "../config/db";
import { User } from "../models";
import "../models/index";

const seed = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });

  const existingAdmin = await User.findOne({ where: { email: "admin@taskmanager.com" } });

  if (existingAdmin) {
    console.log("Default admin already exists: admin@taskmanager.com");
  } else {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await User.create({
      fullName: "System Administrator",
      email: "admin@taskmanager.com",
      password: hashedPassword,
      role: "Admin",
    });
    console.log("Default admin created:");
    console.log("  Email:    admin@taskmanager.com");
    console.log("  Password: Admin@123");
  }

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
