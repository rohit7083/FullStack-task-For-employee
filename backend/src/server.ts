import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB, sequelize } from "./config/db";
import "./models/index"; // ensure associations are registered

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  // sync tables (use migrations in production; sync is fine for this assignment)
  await sequelize.sync({ alter: true });
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
