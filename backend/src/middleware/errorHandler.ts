import { Request, Response, NextFunction } from "express";
import multer from "multer";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "File is too large. Maximum size is 5 MB." });
      return;
    }
    res.status(400).json({ message: err.message });
    return;
  }

  if (err?.message?.includes("Only PDF, JPG, and PNG")) {
    res.status(400).json({ message: err.message });
    return;
  }

  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server.",
  });
};
